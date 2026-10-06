"""Orquestación: análisis de links, revisión y cola de descargas (PRD §6)."""

import json
import logging
import threading
from concurrent.futures import ThreadPoolExecutor
from dataclasses import asdict

from getit import matching, pipeline
from getit.config import load_settings
from getit.db import Database, decode_track, now_iso
from getit.library import Library
from getit.naming import normalize_key
from getit.sources import Candidate, SourceError, TrackInfo, detect_source, youtube

log = logging.getLogger("getit")

# Estados de un lote
ANALYZING, REVIEWING, DOWNLOADING, DONE, FAILED = "analyzing", "reviewing", "downloading", "done", "failed"

# Estados de un tema
MATCHING = "matching"            # buscando candidatos en YouTube
PENDING = "pending"              # listo para descargar
REVIEW = "review"                # el match es dudoso: hay que confirmarlo
QUEUED = "queued"
DOWNLOADING_T = "downloading"
DONE_T = "done"
SKIPPED_DUPLICATE = "skipped_duplicate"
EXCLUDED = "excluded"            # omitido a mano
ERROR = "error"

ACTIVE_TRACK_STATES = (QUEUED, DOWNLOADING_T)
EDITABLE_TRACK_STATES = (PENDING, REVIEW, SKIPPED_DUPLICATE, EXCLUDED, ERROR)
SEARCH_RESULTS = 6


class ActionError(Exception):
    """Acción inválida desde la UI (mensaje legible)."""


class JobRunner:
    def __init__(self, db: Database, library: Library):
        self.db = db
        self.library = library
        self._analysis_pool = ThreadPoolExecutor(max_workers=2, thread_name_prefix="analyze")
        self._search_pool = ThreadPoolExecutor(max_workers=4, thread_name_prefix="search")
        self._download_pool: ThreadPoolExecutor | None = None
        self._download_workers = 0
        self._pool_lock = threading.Lock()

    # ---------- arranque / cierre ----------

    def recover_interrupted(self) -> None:
        """Si la app se cerró a mitad de algo, deja todo en un estado retomable."""
        self.db.execute(
            "UPDATE tracks SET status = ?, message = 'Interrumpido al cerrar la app; vuelve a descargar.' "
            "WHERE status IN (?, ?)",
            (PENDING, QUEUED, DOWNLOADING_T),
        )
        self.db.execute(
            "UPDATE tracks SET status = ?, message = 'Búsqueda interrumpida; elige un candidato o pega un link.' "
            "WHERE status = ?",
            (REVIEW, MATCHING),
        )
        self.db.execute("UPDATE batches SET status = ? WHERE status = ?", (REVIEWING, DOWNLOADING))
        self.db.execute(
            "UPDATE batches SET status = ?, error = 'Análisis interrumpido al cerrar la app.' WHERE status = ?",
            (FAILED, ANALYZING),
        )

    def shutdown(self) -> None:
        self._analysis_pool.shutdown(wait=False, cancel_futures=True)
        self._search_pool.shutdown(wait=False, cancel_futures=True)
        if self._download_pool:
            self._download_pool.shutdown(wait=False, cancel_futures=True)

    def _downloads(self) -> ThreadPoolExecutor:
        workers = load_settings(self.db).concurrency
        with self._pool_lock:
            if self._download_pool is None or workers != self._download_workers:
                if self._download_pool:
                    # Las descargas en curso terminan; las nuevas usan el pool nuevo.
                    self._download_pool.shutdown(wait=False)
                self._download_pool = ThreadPoolExecutor(max_workers=workers, thread_name_prefix="download")
                self._download_workers = workers
            return self._download_pool

    # ---------- análisis ----------

    def start_analysis(self, url: str) -> int:
        url = url.strip()
        if not url:
            raise SourceError("Pega un link primero.")
        source = detect_source(url)
        if source is None:
            raise SourceError(
                "Ese link no lo soporto. Por ahora acepto links de YouTube, "
                "YouTube Music y Spotify (temas, playlists y álbumes)."
            )
        batch_id = self.db.execute(
            "INSERT INTO batches(source, url, status, created_at) VALUES(?, ?, ?, ?)",
            (source.NAME, url, ANALYZING, now_iso()),
        )
        self._analysis_pool.submit(self._analyze, batch_id, source, url)
        return batch_id

    def _analyze(self, batch_id: int, source, url: str) -> None:
        try:
            resolved = source.resolve(url)
            self.db.execute(
                "UPDATE batches SET title = ?, warning = ? WHERE id = ?",
                (resolved.title, resolved.warning, batch_id),
            )
            track_ids = [self._insert_track(batch_id, i, t) for i, t in enumerate(resolved.tracks)]
            needs_search = [
                (tid, info) for tid, info in zip(track_ids, resolved.tracks) if not info.youtube_id
            ]
            # list() espera a que terminen todas las búsquedas.
            list(self._search_pool.map(lambda pair: self._match(*pair), needs_search))
            for track_id in track_ids:
                self._evaluate(track_id)
            self.db.execute("UPDATE batches SET status = ? WHERE id = ?", (REVIEWING, batch_id))
        except SourceError as exc:
            self._fail_batch(batch_id, str(exc))
        except Exception as exc:  # noqa: BLE001 — cualquier sorpresa debe verse en la UI
            log.exception("Análisis falló")
            self._fail_batch(batch_id, f"Error inesperado al analizar: {exc}")

    def _fail_batch(self, batch_id: int, message: str) -> None:
        self.db.execute(
            "UPDATE batches SET status = ?, error = ? WHERE id = ?", (FAILED, message, batch_id)
        )

    def _insert_track(self, batch_id: int, position: int, info: TrackInfo) -> int:
        return self.db.execute(
            "INSERT INTO tracks(batch_id, position, artist, title, album, year, duration, cover_url, "
            "spotify_id, youtube_id, candidates, status) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                batch_id, position, info.artist, info.title, info.album, info.year, info.duration,
                info.cover_url, info.spotify_id, info.youtube_id,
                json.dumps([asdict(c) for c in info.candidates]),
                PENDING if info.youtube_id else MATCHING,
            ),
        )

    def _match(self, track_id: int, info: TrackInfo) -> None:
        try:
            results = youtube.search(f"{info.artist} - {info.title}", SEARCH_RESULTS)
        except SourceError as exc:
            self.db.execute(
                "UPDATE tracks SET status = ?, message = ? WHERE id = ?",
                (REVIEW, f"No pude buscar en YouTube: {exc}", track_id),
            )
            return
        ranked = matching.rank_candidates(info.artist, info.title, info.duration, results)
        if not ranked:
            status, message, chosen = REVIEW, "Sin resultados en YouTube: pega un link a mano.", None
        elif matching.needs_review(ranked):
            status, message, chosen = REVIEW, "Match dudoso: confirma o elige otro candidato.", ranked[0].youtube_id
        else:
            status, message, chosen = PENDING, None, ranked[0].youtube_id
        self.db.execute(
            "UPDATE tracks SET youtube_id = ?, candidates = ?, status = ?, message = ? WHERE id = ?",
            (chosen, json.dumps([asdict(c) for c in ranked]), status, message, track_id),
        )

    def _evaluate(self, track_id: int, base_status: str | None = None) -> None:
        """Aplica los candados: si el tema ya está (biblioteca o este mismo lote), queda saltado."""
        track = self.get_track(track_id)
        if track is None or track["status"] not in (PENDING, REVIEW, SKIPPED_DUPLICATE):
            return
        status = base_status or (REVIEW if track["status"] == REVIEW else PENDING)
        message = track["message"] if status == track["status"] else None
        norm_key = normalize_key(track["artist"], track["title"])
        reason = self.library.find_duplicate(track["youtube_id"], norm_key)
        if reason is None:
            reason = self._duplicate_in_batch(track, norm_key)
        if reason:
            status, message = SKIPPED_DUPLICATE, reason
        self.db.execute(
            "UPDATE tracks SET status = ?, message = ? WHERE id = ?", (status, message, track_id)
        )

    def _duplicate_in_batch(self, track: dict, norm_key: str) -> str | None:
        earlier = self.db.query(
            "SELECT position, artist, title, youtube_id FROM tracks "
            "WHERE batch_id = ? AND position < ? AND status NOT IN (?, ?, ?)",
            (track["batch_id"], track["position"], SKIPPED_DUPLICATE, EXCLUDED, ERROR),
        )
        for other in earlier:
            same_video = track["youtube_id"] and other["youtube_id"] == track["youtube_id"]
            if same_video or normalize_key(other["artist"], other["title"]) == norm_key:
                return f"Repetido en este lote (fila {other['position'] + 1})."
        return None

    # ---------- revisión ----------

    def get_track(self, track_id: int) -> dict | None:
        return decode_track(self.db.one("SELECT * FROM tracks WHERE id = ?", (track_id,)))

    def _editable_track(self, track_id: int) -> dict:
        track = self.get_track(track_id)
        if track is None:
            raise ActionError("Ese tema no existe.")
        if track["status"] not in EDITABLE_TRACK_STATES:
            raise ActionError("Ese tema no se puede editar en su estado actual.")
        return track

    def choose_candidate(self, track_id: int, youtube_id: str) -> dict:
        track = self._editable_track(track_id)
        if youtube_id not in {c["youtube_id"] for c in track["candidates"]}:
            raise ActionError("Ese candidato no pertenece a este tema.")
        self.db.execute(
            "UPDATE tracks SET youtube_id = ?, status = ?, message = NULL WHERE id = ?",
            (youtube_id, PENDING, track_id),
        )
        self._evaluate(track_id, PENDING)
        return self.get_track(track_id)

    def use_manual_link(self, track_id: int, url: str) -> dict:
        track = self._editable_track(track_id)
        candidate: Candidate = youtube.lookup_video(url)
        candidate.score = matching.score_candidate(
            track["artist"], track["title"], track["duration"], candidate
        )
        others = [c for c in track["candidates"] if c["youtube_id"] != candidate.youtube_id]
        self.db.execute(
            "UPDATE tracks SET candidates = ?, youtube_id = ?, status = ?, message = NULL WHERE id = ?",
            (json.dumps([asdict(candidate)] + others), candidate.youtube_id, PENDING, track_id),
        )
        self._evaluate(track_id, PENDING)
        return self.get_track(track_id)

    def update_metadata(self, track_id: int, artist: str, title: str) -> dict:
        track = self._editable_track(track_id)
        artist, title = artist.strip(), title.strip()
        if not artist or not title:
            raise ActionError("Artista y título no pueden quedar vacíos.")
        self.db.execute("UPDATE tracks SET artist = ?, title = ? WHERE id = ?", (artist, title, track_id))
        if track["status"] in (PENDING, REVIEW, SKIPPED_DUPLICATE):
            keep = REVIEW if track["status"] == REVIEW else PENDING
            if track["status"] == SKIPPED_DUPLICATE:
                self.db.execute("UPDATE tracks SET status = ? WHERE id = ?", (PENDING, track_id))
            self._evaluate(track_id, keep)
        return self.get_track(track_id)

    def exclude(self, track_id: int) -> dict:
        self._editable_track(track_id)
        self.db.execute(
            "UPDATE tracks SET status = ?, message = 'Omitido por ti.' WHERE id = ?", (EXCLUDED, track_id)
        )
        return self.get_track(track_id)

    def include(self, track_id: int) -> dict:
        track = self._editable_track(track_id)
        if track["status"] != EXCLUDED:
            return track
        status = PENDING if track["youtube_id"] else REVIEW
        self.db.execute("UPDATE tracks SET status = ?, message = NULL WHERE id = ?", (status, track_id))
        self._evaluate(track_id, status)
        return self.get_track(track_id)

    # ---------- descargas ----------

    def start_download(self, batch_id: int) -> str:
        """Encola los temas 'pending' del lote. Devuelve un mensaje para la UI."""
        batch = self.db.one("SELECT * FROM batches WHERE id = ?", (batch_id,))
        if batch is None:
            raise ActionError("Ese lote no existe.")
        if batch["status"] in (ANALYZING, FAILED):
            raise ActionError("El lote todavía no está listo para descargar.")
        settings = load_settings(self.db)
        pending = self.db.query(
            "SELECT id FROM tracks WHERE batch_id = ? AND status = ? AND youtube_id IS NOT NULL "
            "ORDER BY position",
            (batch_id, PENDING),
        )
        if settings.dry_run:
            return (
                f"Modo prueba activo: se habrían descargado {len(pending)} temas. "
                "No se descargó nada (desactívalo en Ajustes)."
            )
        if not pending:
            return "No hay temas pendientes para descargar."
        pipeline.check_ffmpeg()
        settings.output_dir.mkdir(parents=True, exist_ok=True)
        self._enqueue(batch_id, [row["id"] for row in pending])
        return f"{len(pending)} temas en cola."

    def retry(self, track_id: int) -> str:
        track = self.get_track(track_id)
        if track is None or track["status"] != ERROR:
            raise ActionError("Solo se pueden reintentar temas con error.")
        return self._retry_ids(track["batch_id"], [track_id])

    def retry_failed(self, batch_id: int) -> str:
        rows = self.db.query("SELECT id FROM tracks WHERE batch_id = ? AND status = ?", (batch_id, ERROR))
        if not rows:
            return "No hay temas con error."
        return self._retry_ids(batch_id, [r["id"] for r in rows])

    def _retry_ids(self, batch_id: int, track_ids: list[int]) -> str:
        if load_settings(self.db).dry_run:
            return "Modo prueba activo: no se descargó nada."
        pipeline.check_ffmpeg()
        for track_id in track_ids:
            self.db.execute("UPDATE tracks SET status = ?, message = NULL WHERE id = ?", (PENDING, track_id))
            self._evaluate(track_id, PENDING)
        ready = [
            tid for tid in track_ids if (t := self.get_track(tid)) and t["status"] == PENDING and t["youtube_id"]
        ]
        if ready:
            load_settings(self.db).output_dir.mkdir(parents=True, exist_ok=True)
            self._enqueue(batch_id, ready)
        return f"{len(ready)} temas reintentando."

    def _enqueue(self, batch_id: int, track_ids: list[int]) -> None:
        self.db.execute("UPDATE batches SET status = ? WHERE id = ?", (DOWNLOADING, batch_id))
        pool = self._downloads()
        for track_id in track_ids:
            self.db.execute(
                "UPDATE tracks SET status = ?, message = NULL WHERE id = ?", (QUEUED, track_id)
            )
            pool.submit(self._download_one, track_id)

    def _download_one(self, track_id: int) -> None:
        track = self.get_track(track_id)
        if track is None or track["status"] != QUEUED:
            return
        self.db.execute("UPDATE tracks SET status = ? WHERE id = ?", (DOWNLOADING_T, track_id))
        settings = load_settings(self.db)
        try:
            result = pipeline.process_track(track, settings, self.library)
            self.db.execute(
                "UPDATE tracks SET status = ?, message = ?, file_path = ?, source_bitrate = ? WHERE id = ?",
                (DONE_T, result.warning, str(result.file_path), result.source_bitrate, track_id),
            )
        except pipeline.SkipError as exc:
            self.db.execute(
                "UPDATE tracks SET status = ?, message = ? WHERE id = ?",
                (SKIPPED_DUPLICATE, str(exc), track_id),
            )
        except pipeline.PipelineError as exc:
            self.db.execute(
                "UPDATE tracks SET status = ?, message = ? WHERE id = ?", (ERROR, str(exc), track_id)
            )
        except Exception as exc:  # noqa: BLE001 — un tema que falla no detiene el lote
            log.exception("Descarga falló")
            self.db.execute(
                "UPDATE tracks SET status = ?, message = ? WHERE id = ?",
                (ERROR, f"Error inesperado: {exc}", track_id),
            )
        finally:
            self._refresh_batch(track["batch_id"])

    def _refresh_batch(self, batch_id: int) -> None:
        active = self.db.one(
            "SELECT COUNT(*) AS n FROM tracks WHERE batch_id = ? AND status IN (?, ?)",
            (batch_id, *ACTIVE_TRACK_STATES),
        )
        if active and active["n"] == 0:
            self.db.execute(
                "UPDATE batches SET status = ? WHERE id = ? AND status = ?", (DONE, batch_id, DOWNLOADING)
            )
