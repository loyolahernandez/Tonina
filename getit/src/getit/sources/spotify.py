"""Fuente Spotify: SOLO metadata (nunca audio). El audio se busca después en YouTube.

Plan A: Web API. Con la cuenta conectada (spotify_auth) lee playlists propias completas;
si no, usa client credentials de la app (sirve para temas y álbumes).
Plan B (riesgo R3 del PRD): leer la página pública de embed del link, que no
requiere credenciales. Se usa si no hay credenciales o si la API rechaza la consulta
(p. ej. playlists editoriales de Spotify, que la API ya no expone a apps nuevas).
"""

import json
import os
import re
from urllib.parse import urlparse

import httpx

from getit.sources.base import ResolvedLink, SourceError, TrackInfo

NAME = "spotify"

_KINDS = ("track", "playlist", "album")
_URI_RE = re.compile(r"^spotify:(track|playlist|album):([A-Za-z0-9]+)$")
_PATH_RE = re.compile(r"^/(?:intl-[a-z]{2}(?:-[a-z]{2})?/)?(?:embed/)?(track|playlist|album)/([A-Za-z0-9]+)")
_NEXT_DATA_RE = re.compile(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', re.S)
# La página pública de embed entrega como máximo esta cantidad de temas.
EMBED_LIMIT = 100
_USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0 Safari/537.36"
)


def parse_link(url: str) -> tuple[str, str] | None:
    url = url.strip()
    match = _URI_RE.match(url)
    if match:
        return match.group(1), match.group(2)
    try:
        parsed = urlparse(url)
    except ValueError:
        return None
    if (parsed.hostname or "").lower() != "open.spotify.com":
        return None
    match = _PATH_RE.match(parsed.path)
    return (match.group(1), match.group(2)) if match else None


def matches(url: str) -> bool:
    return parse_link(url) is not None


def resolve(url: str) -> ResolvedLink:
    parsed = parse_link(url)
    if not parsed:
        raise SourceError("No reconozco ese link de Spotify. Usa un link de tema, playlist o álbum.")
    kind, item_id = parsed

    api_problem = None
    user_client = _user_client()
    if user_client is not None:
        try:
            return _resolve_api(kind, item_id, user_client)
        except SourceError as exc:
            api_problem = str(exc)
    elif _has_credentials():
        try:
            return _resolve_api(kind, item_id, _app_client())
        except SourceError as exc:
            api_problem = str(exc)

    try:
        resolved = _resolve_embed(kind, item_id)
    except SourceError as exc:
        reasons = [api_problem or "No hay credenciales de Spotify en .env (SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET)."]
        reasons.append(f"Plan B (página pública): {exc}")
        raise SourceError(
            "No pude leer la metadata de Spotify. " + " ".join(reasons)
            + " Revisa que la playlist sea pública."
        ) from exc

    warnings = []
    if kind == "playlist" and len(resolved.tracks) >= EMBED_LIMIT:
        warnings.append(
            f"Spotify entregó solo {len(resolved.tracks)} temas por la página pública: la playlist "
            "probablemente tiene más."
        )
        if user_client is None:
            warnings.append("Si la playlist es tuya o colaborativa, conecta tu cuenta de Spotify en Inicio y vuelve a analizarla.")
        else:
            warnings.append("Para playlists ajenas, divídela en partes de hasta 100 temas.")
    if user_client is not None and api_problem:
        warnings.insert(0, f"No se pudo leer por API con tu cuenta ({api_problem}); se usó la página pública.")
    resolved.warning = " ".join(warnings) or None
    return resolved


def _user_client():
    from getit import spotify_auth

    try:
        return spotify_auth.user_client()
    except spotify_auth.AuthError:
        return None


def _app_client():
    import spotipy
    from spotipy.oauth2 import SpotifyClientCredentials

    # Se pasan explícitas: spotipy por defecto busca SPOTIPY_* (con P), no SPOTIFY_*.
    auth = SpotifyClientCredentials(
        client_id=os.environ["SPOTIFY_CLIENT_ID"], client_secret=os.environ["SPOTIFY_CLIENT_SECRET"]
    )
    return spotipy.Spotify(auth_manager=auth, requests_timeout=15, retries=2)


def _has_credentials() -> bool:
    return bool(os.getenv("SPOTIFY_CLIENT_ID") and os.getenv("SPOTIFY_CLIENT_SECRET"))


# ---------- Plan A: Web API ----------


def _resolve_api(kind: str, item_id: str, client) -> ResolvedLink:
    import spotipy

    try:
        if kind == "track":
            track = client.track(item_id)
            info = _from_api_track(track, track.get("album") or {})
            return ResolvedLink(NAME, f"{info.artist} - {info.title}", [info])
        if kind == "album":
            album = client.album(item_id)
            tracks = []
            page = album.get("tracks") or {}
            while page:
                tracks += [_from_api_track(t, album) for t in page.get("items") or [] if t]
                page = client.next(page) if page.get("next") else None
            return ResolvedLink(NAME, album.get("name") or "Álbum de Spotify", tracks)

        playlist = client.playlist(item_id, fields="name")
        tracks = []
        page = client.playlist_items(item_id, additional_types=("track",), limit=100)
        while page:
            for item in page.get("items") or []:
                track = (item or {}).get("track") or (item or {}).get("item")
                if not track or track.get("type", "track") != "track" or track.get("is_local") or not track.get("id"):
                    continue
                tracks.append(_from_api_track(track, track.get("album") or {}))
            page = client.next(page) if page.get("next") else None
        if not tracks:
            raise SourceError("La playlist no tiene temas que pueda leer.")
        return ResolvedLink(NAME, playlist.get("name") or "Playlist de Spotify", tracks)
    except spotipy.SpotifyException as exc:
        if exc.http_status in (400, 401):
            raise SourceError("Las credenciales de Spotify no funcionan.") from exc
        if exc.http_status in (403, 404):
            raise SourceError(
                "Spotify solo permite leer por API las playlists tuyas o colaborativas"
                if kind == "playlist" else "La API de Spotify no entrega ese link"
            ) from exc
        raise SourceError(f"La API de Spotify respondió con error {exc.http_status}.") from exc
    except spotipy.oauth2.SpotifyOauthError as exc:
        from getit import spotify_auth

        if client is not None and isinstance(client.auth_manager, spotipy.oauth2.SpotifyOAuth):
            # El acceso fue revocado o expiró sin poder renovarse: se olvida.
            spotify_auth.disconnect()
            raise SourceError("tu sesión de Spotify expiró; vuelve a conectar la cuenta") from exc
        raise SourceError("Las credenciales de Spotify no funcionan.") from exc


def _from_api_track(track: dict, album: dict) -> TrackInfo:
    images = album.get("images") or []
    release = album.get("release_date") or ""
    duration_ms = track.get("duration_ms")
    return TrackInfo(
        artist=", ".join(a["name"] for a in track.get("artists") or [] if a.get("name")) or "Desconocido",
        title=track.get("name") or "Sin título",
        album=album.get("name"),
        year=release[:4] or None,
        duration=round(duration_ms / 1000) if duration_ms else None,
        cover_url=images[0]["url"] if images else None,
        spotify_id=track.get("id"),
    )


# ---------- Plan B: página pública de embed ----------


def _resolve_embed(kind: str, item_id: str) -> ResolvedLink:
    try:
        response = httpx.get(
            f"https://open.spotify.com/embed/{kind}/{item_id}",
            headers={"User-Agent": _USER_AGENT, "Accept-Language": "es-CL,es;q=0.9,en;q=0.8"},
            timeout=15,
            follow_redirects=True,
        )
    except httpx.HTTPError as exc:
        raise SourceError("no pude conectarme a Spotify.") from exc
    if response.status_code != 200:
        raise SourceError(f"Spotify respondió {response.status_code}.")
    return parse_embed_html(kind, item_id, response.text)


def parse_embed_html(kind: str, item_id: str, html: str) -> ResolvedLink:
    match = _NEXT_DATA_RE.search(html)
    if not match:
        raise SourceError("la página pública cambió de formato.")
    try:
        data = json.loads(match.group(1))
        entity = data["props"]["pageProps"]["state"]["data"]["entity"]
    except (ValueError, KeyError, TypeError) as exc:
        raise SourceError("la página pública cambió de formato.") from exc

    name = _clean(entity.get("name") or entity.get("title") or "")
    cover = _cover_from_entity(entity)
    year = _year_from_entity(entity)

    if kind == "track":
        artists = ", ".join(_clean(a.get("name", "")) for a in entity.get("artists") or [] if a.get("name"))
        info = TrackInfo(
            artist=artists or "Desconocido",
            title=name or "Sin título",
            year=year,
            duration=_seconds(entity.get("duration")),
            cover_url=cover,
            spotify_id=item_id,
        )
        return ResolvedLink(NAME, f"{info.artist} - {info.title}", [info])

    tracks = []
    for item in entity.get("trackList") or []:
        uri = item.get("uri") or ""
        if not uri.startswith("spotify:track:"):
            continue
        tracks.append(
            TrackInfo(
                artist=_clean(item.get("subtitle") or "") or "Desconocido",
                title=_clean(item.get("title") or "") or "Sin título",
                album=name if kind == "album" else None,
                year=year if kind == "album" else None,
                duration=_seconds(item.get("duration")),
                # La carátula del álbum solo sirve si el link ES un álbum.
                cover_url=cover if kind == "album" else None,
                spotify_id=uri.rsplit(":", 1)[-1],
            )
        )
    if not tracks:
        raise SourceError("no encontré temas en la página pública.")
    default = "Álbum de Spotify" if kind == "album" else "Playlist de Spotify"
    return ResolvedLink(NAME, name or default, tracks)


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", text.replace(" ", " ")).strip()


def _seconds(milliseconds) -> int | None:
    try:
        return round(int(milliseconds) / 1000) if milliseconds else None
    except (TypeError, ValueError):
        return None


def _cover_from_entity(entity: dict) -> str | None:
    images = (entity.get("visualIdentity") or {}).get("image") or []
    if not images:
        images = (entity.get("coverArt") or {}).get("sources") or []
    if not images:
        return None
    best = max(images, key=lambda img: img.get("maxWidth") or img.get("width") or 0)
    return best.get("url")


def _year_from_entity(entity: dict) -> str | None:
    release = entity.get("releaseDate")
    if isinstance(release, dict):
        release = release.get("isoString")
    if isinstance(release, str) and len(release) >= 4 and release[:4].isdigit():
        return release[:4]
    return None
