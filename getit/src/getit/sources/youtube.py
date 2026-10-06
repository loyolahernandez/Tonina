"""Fuente YouTube / YouTube Music (vía yt-dlp como librería)."""

import re
from urllib.parse import parse_qs, urlparse

import yt_dlp

from getit.naming import clean_title, split_artist_title
from getit.sources.base import Candidate, ResolvedLink, SourceError, TrackInfo

NAME = "youtube"

_HOSTS = {"youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"}
_UNAVAILABLE_TITLES = {"[private video]", "[deleted video]", "[video privado]", "[video eliminado]"}
_VIDEO_ID_RE = re.compile(r"^[A-Za-z0-9_-]{11}$")

# Traducción de errores frecuentes de yt-dlp a algo accionable.
_KNOWN_ERRORS = [
    ("confirm you're not a bot", "YouTube pide verificar que no eres un bot. Espera unos minutos y reintenta."),
    ("confirm your age", "El video requiere verificación de edad; elige otro candidato."),
    ("private video", "El video es privado."),
    ("video unavailable", "El video no está disponible."),
    ("not available in your country", "El video no está disponible en tu país."),
    ("has been removed", "El video fue eliminado."),
    ("members-only", "El video es solo para miembros del canal."),
    ("premieres in", "El video todavía no se estrena."),
    ("http error 403", "YouTube bloqueó la descarga (403). Actualiza yt-dlp: uv lock --upgrade-package yt-dlp && uv sync"),
    ("unable to extract", "yt-dlp no pudo leer YouTube; probablemente cambió algo. Actualiza yt-dlp: uv lock --upgrade-package yt-dlp && uv sync"),
    ("timed out", "Se agotó el tiempo de conexión con YouTube."),
    ("name or service not known", "Sin conexión a internet."),
    ("nodename nor servname", "Sin conexión a internet."),
]


def humanize_error(message: str) -> str:
    lowered = message.lower()
    for needle, human in _KNOWN_ERRORS:
        if needle in lowered:
            return human
    first_line = message.strip().splitlines()[0] if message.strip() else "error desconocido"
    first_line = re.sub(r"^ERROR:\s*", "", first_line)
    first_line = re.sub(r"^\[[^\]]+\]\s*[\w-]+:\s*", "", first_line)
    return f"Error de YouTube: {first_line[:200]}"


def matches(url: str) -> bool:
    try:
        host = urlparse(url.strip()).hostname or ""
    except ValueError:
        return False
    return host.lower() in _HOSTS


def video_id_from_url(url: str) -> str | None:
    """Extrae el ID de un link de video (o acepta un ID pelado)."""
    url = url.strip()
    if _VIDEO_ID_RE.match(url):
        return url
    if not matches(url):
        return None
    parsed = urlparse(url)
    if (parsed.hostname or "").lower() == "youtu.be":
        candidate = parsed.path.lstrip("/").split("/")[0]
        return candidate if _VIDEO_ID_RE.match(candidate) else None
    query = parse_qs(parsed.query)
    if "v" in query and _VIDEO_ID_RE.match(query["v"][0]):
        return query["v"][0]
    match = re.match(r"^/(?:shorts|live|embed)/([A-Za-z0-9_-]{11})", parsed.path)
    return match.group(1) if match else None


def _ydl(**extra) -> yt_dlp.YoutubeDL:
    options = {"quiet": True, "no_warnings": True, "skip_download": True, "noprogress": True}
    options.update(extra)
    return yt_dlp.YoutubeDL(options)


def _extract(target: str, **extra) -> dict:
    try:
        with _ydl(**extra) as ydl:
            return ydl.extract_info(target, download=False) or {}
    except yt_dlp.utils.DownloadError as exc:
        raise SourceError(humanize_error(str(exc))) from exc


def _channel(entry: dict) -> str:
    return entry.get("channel") or entry.get("uploader") or ""


def _track_from_entry(entry: dict) -> TrackInfo:
    channel = _channel(entry)
    raw_title = entry.get("title") or ""
    if entry.get("artist") and entry.get("track"):
        # YouTube Music entrega metadata estructurada en extracción completa.
        artist = entry.get("artist")
        title = clean_title(entry["track"])
    else:
        artist, title = split_artist_title(raw_title, channel)
    duration = int(entry["duration"]) if entry.get("duration") else None
    year = entry.get("release_year")
    return TrackInfo(
        artist=artist,
        title=title,
        album=entry.get("album"),
        year=str(year) if year else None,
        duration=duration,
        youtube_id=entry["id"],
        candidates=[Candidate(entry["id"], raw_title, channel, duration)],
    )


def resolve(url: str) -> ResolvedLink:
    video_id = video_id_from_url(url)
    if video_id:
        # Link de video (aunque traiga &list=): solo ese tema, nunca el mix entero.
        entry = _extract(f"https://www.youtube.com/watch?v={video_id}", noplaylist=True)
        track = _track_from_entry(entry)
        return ResolvedLink(NAME, f"{track.artist} - {track.title}", [track])

    info = _extract(url, extract_flat="in_playlist")
    entries = [
        e
        for e in (info.get("entries") or [])
        if e and e.get("id") and (e.get("title") or "").lower() not in _UNAVAILABLE_TITLES
    ]
    if not entries:
        raise SourceError("No encontré videos disponibles en ese link.")
    tracks = [_track_from_entry(e) for e in entries]
    return ResolvedLink(NAME, info.get("title") or "Playlist de YouTube", tracks)


def lookup_video(url_or_id: str) -> Candidate:
    """Metadata de un video puntual (para cuando el usuario pega un link manual)."""
    video_id = video_id_from_url(url_or_id)
    if not video_id:
        raise SourceError("Ese no parece un link de video de YouTube.")
    entry = _extract(f"https://www.youtube.com/watch?v={video_id}", noplaylist=True)
    duration = int(entry["duration"]) if entry.get("duration") else None
    return Candidate(video_id, entry.get("title") or video_id, _channel(entry), duration)


def search(query: str, limit: int = 6) -> list[Candidate]:
    info = _extract(f"ytsearch{limit}:{query}", extract_flat=True)
    results = []
    for entry in info.get("entries") or []:
        if not entry or not entry.get("id"):
            continue
        duration = int(entry["duration"]) if entry.get("duration") else None
        results.append(Candidate(entry["id"], entry.get("title") or "", _channel(entry), duration))
    return results
