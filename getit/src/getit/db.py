"""SQLite local: lotes, temas, biblioteca (candados) y ajustes."""

import json
import os
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS batches (
    id          INTEGER PRIMARY KEY,
    source      TEXT NOT NULL,
    url         TEXT NOT NULL,
    title       TEXT,
    status      TEXT NOT NULL,
    error       TEXT,
    warning     TEXT,
    created_at  TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS tracks (
    id              INTEGER PRIMARY KEY,
    batch_id        INTEGER NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    position        INTEGER NOT NULL,
    artist          TEXT NOT NULL,
    title           TEXT NOT NULL,
    album           TEXT,
    year            TEXT,
    duration        INTEGER,
    cover_url       TEXT,
    spotify_id      TEXT,
    youtube_id      TEXT,
    candidates      TEXT NOT NULL DEFAULT '[]',
    status          TEXT NOT NULL,
    message         TEXT,
    file_path       TEXT,
    source_bitrate  REAL
);
CREATE INDEX IF NOT EXISTS idx_tracks_batch ON tracks(batch_id);
CREATE TABLE IF NOT EXISTS library (
    id             INTEGER PRIMARY KEY,
    youtube_id     TEXT NOT NULL UNIQUE,
    norm_key       TEXT NOT NULL,
    file_path      TEXT NOT NULL,
    downloaded_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_library_key ON library(norm_key);
CREATE TABLE IF NOT EXISTS settings (
    key    TEXT PRIMARY KEY,
    value  TEXT NOT NULL
);
"""


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def default_db_path() -> Path:
    return Path(os.path.expanduser(os.getenv("GETIT_DB", "~/.getit/getit.db")))


class Database:
    """Conexión única compartida entre hilos, serializada con un lock."""

    def __init__(self, path: Path | str):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.RLock()
        self._conn = sqlite3.connect(self.path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        with self._lock:
            self._conn.execute("PRAGMA journal_mode=WAL")
            self._conn.execute("PRAGMA foreign_keys=ON")
            self._conn.executescript(SCHEMA)
            self._migrate()
            self._conn.commit()
        # Guarda el token de Spotify: solo legible por el usuario.
        os.chmod(self.path, 0o600)

    def _migrate(self) -> None:
        """Columnas agregadas después de la primera versión (DBs ya existentes)."""
        columns = {row["name"] for row in self._conn.execute("PRAGMA table_info(batches)")}
        if "warning" not in columns:
            self._conn.execute("ALTER TABLE batches ADD COLUMN warning TEXT")

    def execute(self, sql: str, params: tuple | dict = ()) -> int:
        """Ejecuta y confirma. Devuelve lastrowid."""
        with self._lock:
            cursor = self._conn.execute(sql, params)
            self._conn.commit()
            return cursor.lastrowid

    def query(self, sql: str, params: tuple | dict = ()) -> list[dict]:
        with self._lock:
            return [dict(row) for row in self._conn.execute(sql, params).fetchall()]

    def one(self, sql: str, params: tuple | dict = ()) -> dict | None:
        rows = self.query(sql, params)
        return rows[0] if rows else None

    def close(self) -> None:
        with self._lock:
            self._conn.close()


def decode_track(row: dict | None) -> dict | None:
    if row is not None:
        row["candidates"] = json.loads(row.get("candidates") or "[]")
    return row
