"""App web local de getit. Escucha solo en 127.0.0.1."""

import logging
import os
import shutil
import subprocess
import threading
import webbrowser
from contextlib import asynccontextmanager
from pathlib import Path
from urllib.parse import urlencode

from dotenv import load_dotenv
from fastapi import FastAPI, Form, HTTPException, Request
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates

from getit import jobs, pipeline, spotify_auth
from getit.config import DEFAULT_PATTERN, MAX_CONCURRENCY, Settings, load_settings, save_settings
from getit.db import Database, decode_track, default_db_path
from getit.library import Library
from getit.naming import format_duration, render_filename
from getit.sources import SourceError

HOST = "127.0.0.1"
TEMPLATES = Jinja2Templates(directory=str(Path(__file__).parent / "templates"))
TEMPLATES.env.filters["duration"] = format_duration

TRACK_LABELS = {
    jobs.MATCHING: "buscando…",
    jobs.PENDING: "pendiente",
    jobs.REVIEW: "revisar",
    jobs.QUEUED: "en cola",
    jobs.DOWNLOADING_T: "descargando…",
    jobs.DONE_T: "listo",
    jobs.SKIPPED_DUPLICATE: "saltado",
    jobs.EXCLUDED: "omitido",
    jobs.ERROR: "error",
}
BATCH_LABELS = {
    jobs.ANALYZING: "analizando…",
    jobs.REVIEWING: "en revisión",
    jobs.DOWNLOADING: "descargando…",
    jobs.DONE: "terminado",
    jobs.FAILED: "falló",
}
TEMPLATES.env.globals.update(track_labels=TRACK_LABELS, batch_labels=BATCH_LABELS, jobs=jobs)


def create_app(db_path: Path | str | None = None) -> FastAPI:
    db = Database(db_path or default_db_path())
    library = Library(db)
    runner = jobs.JobRunner(db, library)
    spotify_auth.configure(db)
    runner.recover_interrupted()
    pipeline.cleanup_tmp(load_settings(db).output_dir)

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        yield
        runner.shutdown()

    app = FastAPI(title="getit", lifespan=lifespan, docs_url=None, redoc_url=None)
    # Rechaza requests con otro Host (protege contra DNS rebinding desde una web maliciosa).
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["127.0.0.1", "localhost", "testserver"])
    app.state.db, app.state.library, app.state.runner = db, library, runner

    def render(request: Request, template: str, status_code: int = 200, **context) -> HTMLResponse:
        return TEMPLATES.TemplateResponse(request, template, context, status_code=status_code)

    def batch_context(batch_id: int) -> dict:
        batch = db.one("SELECT * FROM batches WHERE id = ?", (batch_id,))
        if batch is None:
            raise HTTPException(404, "Lote no encontrado")
        tracks = [
            decode_track(t)
            for t in db.query("SELECT * FROM tracks WHERE batch_id = ? ORDER BY position", (batch_id,))
        ]
        counts: dict[str, int] = {}
        for track in tracks:
            counts[track["status"]] = counts.get(track["status"], 0) + 1
        polling = batch["status"] in (jobs.ANALYZING, jobs.DOWNLOADING) or any(
            t["status"] in (jobs.MATCHING, *jobs.ACTIVE_TRACK_STATES) for t in tracks
        )
        return {
            "batch": batch,
            "tracks": tracks,
            "counts": counts,
            "polling": polling,
            "settings": load_settings(db),
        }

    def tracks_partial(request: Request, batch_id: int, flash: str | None = None, error: str | None = None):
        return render(request, "_tracks.html", flash=flash, error=error, **batch_context(batch_id))

    def track_action(request: Request, track_id: int, action) -> HTMLResponse:
        track = runner.get_track(track_id)
        if track is None:
            raise HTTPException(404, "Tema no encontrado")
        try:
            action()
        except (jobs.ActionError, SourceError, pipeline.PipelineError) as exc:
            return tracks_partial(request, track["batch_id"], error=str(exc))
        return tracks_partial(request, track["batch_id"])

    @app.get("/", response_class=HTMLResponse)
    def index(request: Request, error: str | None = None, flash: str | None = None):
        batches = db.query(
            "SELECT b.*, "
            "(SELECT COUNT(*) FROM tracks t WHERE t.batch_id = b.id) AS total, "
            "(SELECT COUNT(*) FROM tracks t WHERE t.batch_id = b.id AND t.status = 'done') AS done "
            "FROM batches b ORDER BY b.id DESC LIMIT 25"
        )
        return render(
            request,
            "index.html",
            batches=batches,
            error=error,
            flash=flash,
            settings=load_settings(db),
            library_count=library.count(),
            ffmpeg_ok=shutil.which("ffmpeg") is not None,
            spotify_creds=spotify_auth.has_app_credentials(),
            spotify_user=spotify_auth.connected_user(),
            spotify_redirect=spotify_auth.redirect_uri(),
        )

    @app.post("/analyze")
    def analyze(request: Request, url: str = Form("")):
        try:
            batch_id = runner.start_analysis(url)
        except SourceError as exc:
            return index(request, error=str(exc))
        return RedirectResponse(f"/batches/{batch_id}", status_code=303)

    @app.get("/batches/{batch_id}", response_class=HTMLResponse)
    def batch_page(request: Request, batch_id: int):
        return render(request, "batch.html", **batch_context(batch_id))

    @app.get("/batches/{batch_id}/tracks", response_class=HTMLResponse)
    def batch_tracks(request: Request, batch_id: int):
        return tracks_partial(request, batch_id)

    @app.post("/batches/{batch_id}/download", response_class=HTMLResponse)
    def download(request: Request, batch_id: int):
        try:
            message = runner.start_download(batch_id)
        except (jobs.ActionError, pipeline.PipelineError) as exc:
            return tracks_partial(request, batch_id, error=str(exc))
        except OSError as exc:
            return tracks_partial(request, batch_id, error=f"No pude usar la carpeta de salida: {exc}")
        return tracks_partial(request, batch_id, flash=message)

    @app.post("/batches/{batch_id}/retry-failed", response_class=HTMLResponse)
    def retry_failed(request: Request, batch_id: int):
        try:
            message = runner.retry_failed(batch_id)
        except (jobs.ActionError, pipeline.PipelineError) as exc:
            return tracks_partial(request, batch_id, error=str(exc))
        return tracks_partial(request, batch_id, flash=message)

    @app.post("/tracks/{track_id}/choose", response_class=HTMLResponse)
    def choose(request: Request, track_id: int, youtube_id: str = Form(...)):
        return track_action(request, track_id, lambda: runner.choose_candidate(track_id, youtube_id))

    @app.post("/tracks/{track_id}/manual", response_class=HTMLResponse)
    def manual(request: Request, track_id: int, url: str = Form("")):
        return track_action(request, track_id, lambda: runner.use_manual_link(track_id, url))

    @app.post("/tracks/{track_id}/meta", response_class=HTMLResponse)
    def meta(request: Request, track_id: int, artist: str = Form(""), title: str = Form("")):
        return track_action(request, track_id, lambda: runner.update_metadata(track_id, artist, title))

    @app.post("/tracks/{track_id}/exclude", response_class=HTMLResponse)
    def exclude(request: Request, track_id: int):
        return track_action(request, track_id, lambda: runner.exclude(track_id))

    @app.post("/tracks/{track_id}/include", response_class=HTMLResponse)
    def include(request: Request, track_id: int):
        return track_action(request, track_id, lambda: runner.include(track_id))

    @app.post("/tracks/{track_id}/retry", response_class=HTMLResponse)
    def retry(request: Request, track_id: int):
        return track_action(request, track_id, lambda: runner.retry(track_id))

    @app.get("/spotify/login")
    def spotify_login(request: Request):
        try:
            return RedirectResponse(spotify_auth.authorize_url(), status_code=303)
        except spotify_auth.AuthError as exc:
            return index(request, error=str(exc))

    @app.get("/callback")
    def spotify_callback(
        request: Request, code: str | None = None, state: str | None = None, error: str | None = None
    ):
        # Siempre se redirige: recargar /callback no debe reintentar un código ya usado.
        try:
            name = spotify_auth.complete_login(code, state, error)
        except spotify_auth.AuthError as exc:
            return RedirectResponse(f"/?{urlencode({'error': str(exc)})}", status_code=303)
        return RedirectResponse(f"/?{urlencode({'flash': f'Spotify conectado como {name}.'})}", status_code=303)

    @app.post("/spotify/logout")
    def spotify_logout():
        spotify_auth.disconnect()
        return RedirectResponse("/", status_code=303)

    @app.get("/settings", response_class=HTMLResponse)
    def settings_page(request: Request, saved: bool = False, error: str | None = None):
        settings = load_settings(db)
        return render(
            request,
            "settings.html",
            settings=settings,
            saved=saved,
            error=error,
            max_concurrency=MAX_CONCURRENCY,
            example=render_filename(settings.filename_pattern, "Artista", "Título (Extended Mix)"),
        )

    @app.post("/settings")
    def save(
        request: Request,
        output_dir: str = Form(...),
        filename_pattern: str = Form(DEFAULT_PATTERN),
        concurrency: int = Form(3),
        dry_run: bool = Form(False),
    ):
        path = Path(os.path.expanduser(output_dir.strip()))
        if not path.is_absolute():
            return settings_page(request, error="La carpeta de salida debe ser una ruta absoluta (o empezar con ~).")
        pattern = filename_pattern.strip() or DEFAULT_PATTERN
        if "{" not in pattern:
            return settings_page(request, error="El patrón debe incluir al menos {artist} o {title}.")
        save_settings(db, Settings(output_dir=path, filename_pattern=pattern, concurrency=concurrency, dry_run=dry_run))
        return RedirectResponse("/settings?saved=1", status_code=303)

    @app.post("/open-folder")
    def open_folder():
        folder = load_settings(db).output_dir
        folder.mkdir(parents=True, exist_ok=True)
        subprocess.run(["open", str(folder)], check=False)
        return HTMLResponse("", status_code=204)

    return app


def run() -> None:
    import uvicorn

    load_dotenv(Path.cwd() / ".env")
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
    port = int(os.getenv("GETIT_PORT", "8765"))
    url = f"http://{HOST}:{port}"
    print(f"getit corriendo en {url}  (Ctrl+C para salir)")
    if os.getenv("GETIT_NO_BROWSER") != "1":
        threading.Timer(1.0, lambda: webbrowser.open(url)).start()
    uvicorn.run(create_app(), host=HOST, port=port, log_level="warning")


if __name__ == "__main__":
    run()
