"""Un tema: descargar → convertir a AIFF → tags + carátula → mover a la carpeta de salida.

Todo se trabaja en <carpeta_salida>/.getit-tmp/ (mismo disco) y el AIFF terminado se
mueve al final sin sobrescribir: nunca queda un archivo a medio escribir a la vista.
"""

import os
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

import httpx
import yt_dlp
from mutagen.aiff import AIFF
from mutagen.id3 import APIC, COMM, TALB, TDRC, TIT2, TPE1

from getit.config import Settings
from getit.library import DuplicateError, Library
from getit.naming import normalize_key, render_filename
from getit.sources.youtube import humanize_error

TMP_DIR_NAME = ".getit-tmp"


class PipelineError(Exception):
    """Fallo con mensaje legible para la UI."""


class SkipError(Exception):
    """El tema se salta a propósito (no es un fallo)."""


@dataclass
class TrackResult:
    file_path: Path
    source_bitrate: float | None
    warning: str | None = None


def check_ffmpeg() -> None:
    if not shutil.which("ffmpeg"):
        raise PipelineError("ffmpeg no está instalado. Instálalo con: brew install ffmpeg")


def cleanup_tmp(output_dir: Path) -> None:
    """Borra restos de descargas interrumpidas."""
    shutil.rmtree(output_dir / TMP_DIR_NAME, ignore_errors=True)


def target_path(track: dict, settings: Settings) -> Path:
    name = render_filename(settings.filename_pattern, track["artist"], track["title"])
    return settings.output_dir / name


def process_track(track: dict, settings: Settings, library: Library) -> TrackResult:
    youtube_id = track.get("youtube_id")
    if not youtube_id:
        raise PipelineError("No hay video elegido para este tema.")
    norm_key = normalize_key(track["artist"], track["title"])
    target = target_path(track, settings)

    try:
        with library.claim(youtube_id, norm_key):
            if target.exists():
                raise SkipError(f"Ya existe un archivo con ese nombre: {target.name}")
            tmp_root = settings.output_dir / TMP_DIR_NAME
            tmp_root.mkdir(parents=True, exist_ok=True)
            work = Path(tempfile.mkdtemp(prefix="track-", dir=tmp_root))
            try:
                source, bitrate = download_audio(youtube_id, work)
                aiff = work / "out.aiff"
                convert_to_aiff(source, aiff)
                cover = fetch_cover(track.get("cover_url"), youtube_id, work)
                write_tags(aiff, track, cover, youtube_id, bitrate)
                move_without_overwrite(aiff, target)
                library.register(youtube_id, norm_key, target)
            finally:
                shutil.rmtree(work, ignore_errors=True)
    except DuplicateError as exc:
        raise SkipError(str(exc)) from exc

    warning = None if cover else "Sin carátula (no se pudo descargar)."
    return TrackResult(target, bitrate, warning)


def download_audio(youtube_id: str, work: Path) -> tuple[Path, float | None]:
    options = {
        "format": "bestaudio/best",
        "outtmpl": str(work / "source.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
        "noprogress": True,
        "noplaylist": True,
    }
    try:
        with yt_dlp.YoutubeDL(options) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={youtube_id}", download=True)
    except yt_dlp.utils.DownloadError as exc:
        raise PipelineError(humanize_error(str(exc))) from exc

    downloads = info.get("requested_downloads") or []
    path = Path(downloads[0]["filepath"]) if downloads and downloads[0].get("filepath") else None
    if path is None or not path.exists():
        found = sorted(work.glob("source.*"))
        if not found:
            raise PipelineError("yt-dlp terminó pero no dejó ningún archivo de audio.")
        path = found[0]
    return path, info.get("abr")


def _run_ffmpeg(args: list[str], what: str) -> None:
    check_ffmpeg()
    result = subprocess.run(
        ["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y", *args],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        detail = (result.stderr or "").strip().splitlines()[-1:] or ["sin detalle"]
        raise PipelineError(f"ffmpeg falló al {what}: {detail[0][:200]}")


def convert_to_aiff(source: Path, destination: Path) -> None:
    # PCM 16-bit / 44.1 kHz estéreo: lo que rekordbox y los CDJ leen sin problemas.
    # Sin upsampling a 24-bit ni a 48 kHz: no agrega calidad (PRD NO4).
    _run_ffmpeg(
        ["-i", str(source), "-vn", "-map_metadata", "-1",
         "-c:a", "pcm_s16be", "-ar", "44100", "-ac", "2", str(destination)],
        "convertir a AIFF",
    )


def fetch_cover(cover_url: str | None, youtube_id: str, work: Path) -> bytes | None:
    """Carátula JPEG. Spotify ya la entrega cuadrada; la miniatura de YouTube se recorta al centro."""
    if cover_url:
        data = _download_image(cover_url)
        if data:
            return data
    for size in ("maxresdefault", "hqdefault"):
        data = _download_image(f"https://i.ytimg.com/vi/{youtube_id}/{size}.jpg")
        if not data:
            continue
        raw, square = work / "thumb.jpg", work / "cover.jpg"
        raw.write_bytes(data)
        try:
            _run_ffmpeg(
                ["-i", str(raw), "-vf", "crop='min(iw,ih)':'min(iw,ih)',scale=600:600",
                 "-q:v", "3", str(square)],
                "recortar la carátula",
            )
            return square.read_bytes()
        except PipelineError:
            return data
    return None


def _download_image(url: str) -> bytes | None:
    try:
        response = httpx.get(url, timeout=15, follow_redirects=True)
    except httpx.HTTPError:
        return None
    if response.status_code != 200 or not response.content:
        return None
    return response.content


def write_tags(
    path: Path,
    track: dict,
    cover: bytes | None,
    youtube_id: str,
    bitrate: float | None,
) -> None:
    audio = AIFF(path)
    if audio.tags is None:
        audio.add_tags()
    tags = audio.tags
    tags.add(TPE1(encoding=3, text=track["artist"]))
    tags.add(TIT2(encoding=3, text=track["title"]))
    if track.get("album"):
        tags.add(TALB(encoding=3, text=track["album"]))
    if track.get("year"):
        tags.add(TDRC(encoding=3, text=str(track["year"])))
    if cover:
        tags.add(APIC(encoding=3, mime="image/jpeg", type=3, desc="Cover", data=cover))
    quality = f" · fuente ~{round(bitrate)} kbps" if bitrate else ""
    tags.add(COMM(encoding=3, lang="spa", desc="", text=f"getit · youtube:{youtube_id}{quality}"))
    # ID3v2.3: la versión que rekordbox lee con menos sorpresas.
    audio.save(v2_version=3)


def move_without_overwrite(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    try:
        # link() falla si el destino existe: sin carrera ni sobrescritura.
        os.link(source, target)
        source.unlink()
        return
    except FileExistsError as exc:
        raise SkipError(f"Ya existe un archivo con ese nombre: {target.name}") from exc
    except OSError:
        # Discos que no soportan hard links (exFAT/FAT32 de un pendrive).
        pass
    if target.exists():
        raise SkipError(f"Ya existe un archivo con ese nombre: {target.name}")
    os.replace(source, target)
