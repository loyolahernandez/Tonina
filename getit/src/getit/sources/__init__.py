"""Registro de fuentes. Agregar una fuente = un módulo con `NAME`, `matches(url)` y `resolve(url)`."""

from getit.sources import spotify, youtube
from getit.sources.base import Candidate, ResolvedLink, SourceError, TrackInfo

SOURCES = [youtube, spotify]


def detect_source(url: str):
    for source in SOURCES:
        if source.matches(url):
            return source
    return None


def resolve_link(url: str) -> ResolvedLink:
    source = detect_source(url.strip())
    if source is None:
        raise SourceError(
            "Ese link no lo soporto. Por ahora acepto links de YouTube, "
            "YouTube Music y Spotify (temas, playlists y álbumes)."
        )
    return source.resolve(url.strip())


__all__ = [
    "Candidate",
    "ResolvedLink",
    "SourceError",
    "TrackInfo",
    "detect_source",
    "resolve_link",
]
