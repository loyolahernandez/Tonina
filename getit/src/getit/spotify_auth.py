"""Login con la cuenta de Spotify del usuario (solo lectura de sus playlists).

Desde 2026 la Web API solo entrega los temas de playlists propias o colaborativas,
y solo con un token de usuario. El token se guarda en la DB local (nunca sale de la Mac).
Ver docs/prd/spotify-login-playlists.md.
"""

import json
import os
import secrets
import threading

from spotipy.cache_handler import CacheHandler

from getit.db import Database

SCOPES = "playlist-read-private playlist-read-collaborative"
TOKEN_KEY = "spotify_token"
USER_KEY = "spotify_user"

_db: Database | None = None
_pending_states: set[str] = set()
_states_lock = threading.Lock()


class AuthError(Exception):
    """Mensaje legible para la UI."""


def configure(db: Database) -> None:
    global _db
    _db = db


def _require_db() -> Database:
    if _db is None:
        raise RuntimeError("spotify_auth.configure(db) no fue llamado")
    return _db


def has_app_credentials() -> bool:
    return bool(os.getenv("SPOTIFY_CLIENT_ID") and os.getenv("SPOTIFY_CLIENT_SECRET"))


def redirect_uri() -> str:
    port = os.getenv("GETIT_PORT", "8765")
    return os.getenv("SPOTIFY_REDIRECT_URI", f"http://127.0.0.1:{port}/callback")


class DatabaseCacheHandler(CacheHandler):
    """Guarda el token de spotipy en la tabla settings."""

    def __init__(self, db: Database):
        self.db = db

    def get_cached_token(self):
        row = self.db.one("SELECT value FROM settings WHERE key = ?", (TOKEN_KEY,))
        return json.loads(row["value"]) if row else None

    def save_token_to_cache(self, token_info):
        self.db.execute(
            "INSERT INTO settings(key, value) VALUES(?, ?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (TOKEN_KEY, json.dumps(token_info)),
        )


def _oauth():
    from spotipy.oauth2 import SpotifyOAuth

    if not has_app_credentials():
        raise AuthError(
            "Faltan SPOTIFY_CLIENT_ID y SPOTIFY_CLIENT_SECRET en .env. "
            "Créalos en developer.spotify.com/dashboard (requiere Premium)."
        )
    return SpotifyOAuth(
        client_id=os.environ["SPOTIFY_CLIENT_ID"],
        client_secret=os.environ["SPOTIFY_CLIENT_SECRET"],
        redirect_uri=redirect_uri(),
        scope=SCOPES,
        cache_handler=DatabaseCacheHandler(_require_db()),
        open_browser=False,
        requests_timeout=15,
    )


def authorize_url() -> str:
    state = secrets.token_urlsafe(24)
    with _states_lock:
        _pending_states.add(state)
    return _oauth().get_authorize_url(state=state)


def complete_login(code: str | None, state: str | None, error: str | None) -> str:
    """Procesa el retorno de Spotify. Devuelve el nombre de la cuenta conectada."""
    with _states_lock:
        valid = bool(state) and state in _pending_states
        if valid:
            _pending_states.discard(state)
    if not valid:
        raise AuthError("La respuesta de Spotify no corresponde a un login iniciado desde getit. Intenta de nuevo.")
    if error:
        raise AuthError("No se conectó Spotify: cancelaste o Spotify rechazó el permiso." if error == "access_denied"
                        else f"Spotify devolvió un error: {error}")
    if not code:
        raise AuthError("Spotify no devolvió un código de acceso.")

    import spotipy

    oauth = _oauth()
    try:
        oauth.get_access_token(code, as_dict=False, check_cache=False)
        profile = spotipy.Spotify(auth_manager=oauth, requests_timeout=15).current_user()
    except (spotipy.SpotifyException, spotipy.oauth2.SpotifyOauthError) as exc:
        disconnect()
        raise AuthError(
            "Spotify no aceptó el login. Revisa que la Redirect URI del dashboard sea "
            f"exactamente {redirect_uri()} y que tu cuenta sea Premium."
        ) from exc
    name = profile.get("display_name") or profile.get("id") or "tu cuenta"
    _require_db().execute(
        "INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (USER_KEY, name),
    )
    return name


def connected_user() -> str | None:
    db = _require_db()
    if not db.one("SELECT 1 FROM settings WHERE key = ?", (TOKEN_KEY,)):
        return None
    row = db.one("SELECT value FROM settings WHERE key = ?", (USER_KEY,))
    return row["value"] if row else "tu cuenta"


def disconnect() -> None:
    db = _require_db()
    db.execute("DELETE FROM settings WHERE key IN (?, ?)", (TOKEN_KEY, USER_KEY))


def user_client():
    """Cliente de spotipy autenticado como el usuario, o None si no está conectado."""
    if _db is None or not has_app_credentials() or connected_user() is None:
        return None
    import spotipy

    return spotipy.Spotify(auth_manager=_oauth(), requests_timeout=15, retries=2)
