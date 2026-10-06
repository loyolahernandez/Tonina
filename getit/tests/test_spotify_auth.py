import json
import sqlite3
from urllib.parse import parse_qs, urlparse

import pytest
import spotipy

from getit import spotify_auth
from getit.db import Database
from getit.sources import ResolvedLink, SourceError, TrackInfo, spotify


@pytest.fixture
def auth_db(db, monkeypatch):
    monkeypatch.setenv("SPOTIFY_CLIENT_ID", "cid")
    monkeypatch.setenv("SPOTIFY_CLIENT_SECRET", "secret")
    monkeypatch.setenv("GETIT_PORT", "8765")
    spotify_auth.configure(db)
    yield db
    spotify_auth.configure(None)


def test_cache_handler_roundtrip(auth_db):
    handler = spotify_auth.DatabaseCacheHandler(auth_db)
    assert handler.get_cached_token() is None
    handler.save_token_to_cache({"access_token": "a", "refresh_token": "r"})
    assert handler.get_cached_token()["refresh_token"] == "r"
    assert spotify_auth.connected_user() == "tu cuenta"
    spotify_auth.disconnect()
    assert spotify_auth.connected_user() is None


def test_authorize_url_is_read_only_and_uses_loopback(auth_db):
    query = parse_qs(urlparse(spotify_auth.authorize_url()).query)
    assert query["redirect_uri"] == ["http://127.0.0.1:8765/callback"]
    assert set(query["scope"][0].split()) == {"playlist-read-private", "playlist-read-collaborative"}
    assert query["state"][0]


def test_callback_rejects_unknown_state(auth_db):
    with pytest.raises(spotify_auth.AuthError, match="no corresponde"):
        spotify_auth.complete_login("code", "inventado", None)
    assert spotify_auth.connected_user() is None


def test_callback_access_denied(auth_db):
    state = parse_qs(urlparse(spotify_auth.authorize_url()).query)["state"][0]
    with pytest.raises(spotify_auth.AuthError, match="cancelaste"):
        spotify_auth.complete_login(None, state, "access_denied")
    # El state es de un solo uso.
    with pytest.raises(spotify_auth.AuthError, match="no corresponde"):
        spotify_auth.complete_login("code", state, None)


def test_login_without_app_credentials(db, monkeypatch):
    monkeypatch.delenv("SPOTIFY_CLIENT_ID", raising=False)
    monkeypatch.delenv("SPOTIFY_CLIENT_SECRET", raising=False)
    spotify_auth.configure(db)
    with pytest.raises(spotify_auth.AuthError, match="developer.spotify.com"):
        spotify_auth.authorize_url()
    assert spotify_auth.user_client() is None
    spotify_auth.configure(None)


class FakeUserClient:
    """Imita un spotipy.Spotify autenticado con una playlist de 158 temas."""

    def __init__(self, forbidden=False, total=158):
        self.forbidden, self.total = forbidden, total
        self.auth_manager = None

    def _check(self):
        if self.forbidden:
            raise spotipy.SpotifyException(403, -1, "Forbidden")

    def playlist(self, playlist_id, fields=None):
        return {"name": "Mi set"}

    def playlist_items(self, playlist_id, additional_types=("track",), limit=100, offset=0):
        self._check()
        return self._page(0)

    def _page(self, offset):
        end = min(offset + 100, self.total)
        items = [
            {"item": {"id": f"t{i}", "type": "track", "name": f"Tema {i}", "duration_ms": 200000,
                      "artists": [{"name": "Kuervos"}], "album": {"name": "Disco", "release_date": "2024-01-01",
                                                                   "images": [{"url": "cover"}]}}}
            for i in range(offset, end)
        ]
        return {"items": items, "next": f"offset={end}" if end < self.total else None, "_offset": end}

    def next(self, page):
        return self._page(page["_offset"])


def test_connected_user_gets_full_playlist(monkeypatch):
    monkeypatch.setattr(spotify, "_user_client", lambda: FakeUserClient())
    resolved = spotify.resolve("https://open.spotify.com/playlist/abc")
    assert len(resolved.tracks) == 158
    assert resolved.warning is None
    assert resolved.tracks[0].album == "Disco" and resolved.tracks[0].year == "2024"


def _embed_100(kind, item_id):
    return ResolvedLink("spotify", "Ajena", [TrackInfo("A", f"T{i}", duration=200) for i in range(100)])


def test_not_owned_playlist_falls_back_with_warning(monkeypatch):
    monkeypatch.setattr(spotify, "_user_client", lambda: FakeUserClient(forbidden=True))
    monkeypatch.setattr(spotify, "_resolve_embed", _embed_100)
    resolved = spotify.resolve("https://open.spotify.com/playlist/abc")
    assert len(resolved.tracks) == 100
    assert "tuyas o colaborativas" in resolved.warning
    assert "probablemente tiene más" in resolved.warning
    assert "divídela" in resolved.warning


def test_embed_cap_warns_when_not_connected(monkeypatch):
    monkeypatch.delenv("SPOTIFY_CLIENT_ID", raising=False)
    monkeypatch.setattr(spotify, "_user_client", lambda: None)
    monkeypatch.setattr(spotify, "_resolve_embed", _embed_100)
    resolved = spotify.resolve("https://open.spotify.com/playlist/abc")
    assert "conecta tu cuenta" in resolved.warning


def test_short_embed_playlist_has_no_warning(monkeypatch):
    monkeypatch.delenv("SPOTIFY_CLIENT_ID", raising=False)
    monkeypatch.setattr(spotify, "_user_client", lambda: None)
    monkeypatch.setattr(
        spotify, "_resolve_embed",
        lambda kind, item_id: ResolvedLink("spotify", "Corta", [TrackInfo("A", "T", duration=200)]),
    )
    assert spotify.resolve("https://open.spotify.com/playlist/abc").warning is None


def test_migrates_old_database(tmp_path):
    path = tmp_path / "old.db"
    conn = sqlite3.connect(path)
    conn.execute("CREATE TABLE batches (id INTEGER PRIMARY KEY, source TEXT NOT NULL, url TEXT NOT NULL, "
                 "title TEXT, status TEXT NOT NULL, error TEXT, created_at TEXT NOT NULL)")
    conn.commit()
    conn.close()
    db = Database(path)
    db.execute("INSERT INTO batches(source, url, status, warning, created_at) VALUES('s', 'u', 'done', 'w', 'now')")
    assert db.one("SELECT warning FROM batches")["warning"] == "w"
    assert (path.stat().st_mode & 0o777) == 0o600
    db.close()
