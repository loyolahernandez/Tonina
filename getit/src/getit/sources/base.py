"""Interfaz común de las fuentes. Cada fuente resuelve un link a una lista de temas."""

from dataclasses import dataclass, field


class SourceError(Exception):
    """Error con mensaje legible para mostrar tal cual en la UI."""


@dataclass
class Candidate:
    youtube_id: str
    title: str
    channel: str
    duration: int | None = None
    score: float | None = None


@dataclass
class TrackInfo:
    artist: str
    title: str
    album: str | None = None
    year: str | None = None
    duration: int | None = None
    cover_url: str | None = None
    spotify_id: str | None = None
    # Solo lo trae una fuente que ya es YouTube; si falta, hay que buscar candidatos.
    youtube_id: str | None = None
    candidates: list[Candidate] = field(default_factory=list)


@dataclass
class ResolvedLink:
    source: str
    title: str
    tracks: list[TrackInfo]
    # Algo que el usuario debe saber del resultado (ej. "lista posiblemente cortada").
    warning: str | None = None
