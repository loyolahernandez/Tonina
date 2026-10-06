"""Biblioteca de lo ya descargado y los dos candados anti-duplicado (PRD §5).

Candado 1: un video de YouTube = un archivo (youtube_id).
Candado 2: un tema = un archivo (artista + título normalizados).
Además, mientras un tema se descarga queda "reservado" en memoria para que dos
descargas en paralelo del mismo tema no pasen ambas el chequeo.
"""

import threading
from contextlib import contextmanager
from pathlib import Path

from getit.db import Database, now_iso


class DuplicateError(Exception):
    """El tema ya existe; el mensaje explica dónde."""


class Library:
    def __init__(self, db: Database):
        self.db = db
        self._lock = threading.Lock()
        self._inflight_ids: set[str] = set()
        self._inflight_keys: set[str] = set()

    def find_duplicate(self, youtube_id: str | None, norm_key: str) -> str | None:
        """Motivo legible si el tema ya está en la biblioteca, o None."""
        if youtube_id:
            row = self.db.one("SELECT file_path FROM library WHERE youtube_id = ?", (youtube_id,))
            if row:
                return f"Ya descargaste este video: {Path(row['file_path']).name}"
        row = self.db.one("SELECT file_path FROM library WHERE norm_key = ?", (norm_key,))
        if row:
            return f"Ya tienes este tema: {Path(row['file_path']).name}"
        return None

    @contextmanager
    def claim(self, youtube_id: str, norm_key: str):
        """Reserva el tema durante la descarga. Lanza DuplicateError si ya existe o está en curso."""
        with self._lock:
            reason = self.find_duplicate(youtube_id, norm_key)
            if reason is None and (youtube_id in self._inflight_ids or norm_key in self._inflight_keys):
                reason = "Este tema ya se está descargando en otra fila."
            if reason:
                raise DuplicateError(reason)
            self._inflight_ids.add(youtube_id)
            self._inflight_keys.add(norm_key)
        try:
            yield
        finally:
            with self._lock:
                self._inflight_ids.discard(youtube_id)
                self._inflight_keys.discard(norm_key)

    def register(self, youtube_id: str, norm_key: str, file_path: Path) -> None:
        self.db.execute(
            "INSERT INTO library(youtube_id, norm_key, file_path, downloaded_at) VALUES(?, ?, ?, ?)",
            (youtube_id, norm_key, str(file_path), now_iso()),
        )

    def count(self) -> int:
        row = self.db.one("SELECT COUNT(*) AS n FROM library")
        return row["n"] if row else 0
