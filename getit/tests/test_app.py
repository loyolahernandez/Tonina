import time

import pytest
from fastapi.testclient import TestClient

from getit import jobs, main, pipeline
from getit.config import load_settings, save_settings
from getit.sources import ResolvedLink, TrackInfo, spotify, youtube
from getit.sources.base import Candidate

PLAYLIST = ResolvedLink("spotify", "Para el sábado", [
    TrackInfo("Kuervos", "Noche Larga", duration=210, spotify_id="1"),
    TrackInfo("Desconocidos", "Tema Raro", duration=200, spotify_id="2"),
    TrackInfo("Kuervos", "Noche Larga", duration=210, spotify_id="3"),
])


def fake_search(query, limit=6):
    if "Noche Larga" in query:
        return [
            Candidate("aaaaaaaaaaa", "Noche Larga", "Kuervos - Topic", 210),
            Candidate("bbbbbbbbbbb", "Kuervos - Noche Larga (sped up)", "fan", 170),
        ]
    return [Candidate("ccccccccccc", "algo distinto", "nadie", 90)]


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(spotify, "resolve", lambda url: PLAYLIST)
    monkeypatch.setattr(youtube, "search", fake_search)
    monkeypatch.setenv("GETIT_OUTPUT_DIR", str(tmp_path / "out"))
    app = main.create_app(tmp_path / "app.db")
    with TestClient(app) as test_client:
        test_client.app_state = app.state
        yield test_client


def wait_for(predicate, timeout=5.0):
    deadline = time.time() + timeout
    while time.time() < deadline:
        if predicate():
            return
        time.sleep(0.05)
    raise AssertionError("timeout esperando estado")


def tracks(client, batch_id):
    return client.app_state.db.query("SELECT * FROM tracks WHERE batch_id = ? ORDER BY position", (batch_id,))


def batch_status(client, batch_id):
    return client.app_state.db.one("SELECT status FROM batches WHERE id = ?", (batch_id,))["status"]


def analyze(client):
    response = client.post("/analyze", data={"url": "https://open.spotify.com/playlist/abc"}, follow_redirects=False)
    assert response.status_code == 303
    batch_id = int(response.headers["location"].rsplit("/", 1)[1])
    wait_for(lambda: batch_status(client, batch_id) == jobs.REVIEWING)
    return batch_id


def test_index_renders(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "Pega un link" in response.text


def test_unsupported_link_shows_error(client):
    response = client.post("/analyze", data={"url": "https://soundcloud.com/x/y"})
    assert "no lo soporto" in response.text


def test_rejects_foreign_host_header(client):
    assert client.get("/", headers={"host": "evil.example"}).status_code == 400


def test_analysis_matches_reviews_and_dedupes(client):
    batch_id = analyze(client)
    first, weird, repeated = tracks(client, batch_id)
    assert (first["status"], first["youtube_id"]) == (jobs.PENDING, "aaaaaaaaaaa")
    assert weird["status"] == jobs.REVIEW
    assert repeated["status"] == jobs.SKIPPED_DUPLICATE
    page = client.get(f"/batches/{batch_id}")
    assert "Para el sábado" in page.text and "revisar" in page.text


def test_dry_run_downloads_nothing(client, monkeypatch):
    db = client.app_state.db
    settings = load_settings(db)
    settings.dry_run = True
    save_settings(db, settings)
    called = []
    monkeypatch.setattr(pipeline, "process_track", lambda *a: called.append(a))
    batch_id = analyze(client)
    response = client.post(f"/batches/{batch_id}/download")
    assert "Modo prueba" in response.text
    assert not called


def test_download_flow_with_failure_and_retry(client, monkeypatch):
    attempts = {"n": 0}

    def fake_process(track, settings, library):
        attempts["n"] += 1
        if track["youtube_id"] == "ccccccccccc" and attempts["n"] < 3:
            raise pipeline.PipelineError("El video no está disponible.")
        return pipeline.TrackResult(settings.output_dir / f"{track['title']}.aiff", 128.0)

    monkeypatch.setattr(pipeline, "process_track", fake_process)
    monkeypatch.setattr(pipeline, "check_ffmpeg", lambda: None)
    batch_id = analyze(client)
    weird = tracks(client, batch_id)[1]

    # Confirmar el candidato dudoso lo deja pendiente.
    client.post(f"/tracks/{weird['id']}/choose", data={"youtube_id": "ccccccccccc"})
    assert tracks(client, batch_id)[1]["status"] == jobs.PENDING

    client.post(f"/batches/{batch_id}/download")
    wait_for(lambda: batch_status(client, batch_id) == jobs.DONE)
    statuses = [t["status"] for t in tracks(client, batch_id)]
    assert statuses == [jobs.DONE_T, jobs.ERROR, jobs.SKIPPED_DUPLICATE]
    assert tracks(client, batch_id)[1]["message"] == "El video no está disponible."

    client.post(f"/batches/{batch_id}/retry-failed")
    wait_for(lambda: tracks(client, batch_id)[1]["status"] == jobs.DONE_T)


def test_exclude_and_include(client):
    batch_id = analyze(client)
    first = tracks(client, batch_id)[0]
    client.post(f"/tracks/{first['id']}/exclude")
    assert tracks(client, batch_id)[0]["status"] == jobs.EXCLUDED
    client.post(f"/tracks/{first['id']}/include")
    assert tracks(client, batch_id)[0]["status"] == jobs.PENDING


def test_edit_metadata(client):
    batch_id = analyze(client)
    weird = tracks(client, batch_id)[1]
    client.post(f"/tracks/{weird['id']}/meta", data={"artist": "Otro", "title": "Nombre Real"})
    updated = tracks(client, batch_id)[1]
    assert (updated["artist"], updated["title"], updated["status"]) == ("Otro", "Nombre Real", jobs.REVIEW)


def test_batch_shows_truncation_warning(client, monkeypatch):
    monkeypatch.setattr(spotify, "resolve", lambda url: ResolvedLink(
        "spotify", "Larga", PLAYLIST.tracks[:1], warning="Spotify entregó solo 100 temas"))
    batch_id = analyze(client)
    assert "Spotify entregó solo 100 temas" in client.get(f"/batches/{batch_id}").text


def test_spotify_callback_with_bad_state_redirects_with_error(client):
    response = client.get("/callback?code=x&state=inventado", follow_redirects=False)
    assert response.status_code == 303
    assert "no+corresponde" in response.headers["location"] or "no%20corresponde" in response.headers["location"]
    assert "no corresponde" in client.get(response.headers["location"]).text


def test_settings_roundtrip(client, tmp_path):
    response = client.post(
        "/settings",
        data={"output_dir": str(tmp_path / "x"), "filename_pattern": "{title} - {artist}", "concurrency": "2"},
        follow_redirects=True,
    )
    assert "Guardado" in response.text
    settings = load_settings(client.app_state.db)
    assert settings.concurrency == 2 and settings.filename_pattern == "{title} - {artist}" and not settings.dry_run
