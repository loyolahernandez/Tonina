"""Ajustes editables desde la UI (guardados en SQLite, con defaults desde el entorno)."""

import os
from dataclasses import dataclass
from pathlib import Path

from getit.db import Database

DEFAULT_PATTERN = "{artist} - {title}"
MAX_CONCURRENCY = 8


@dataclass
class Settings:
    output_dir: Path
    filename_pattern: str = DEFAULT_PATTERN
    concurrency: int = 3
    dry_run: bool = False
    # Fijo en el MVP (PRD §5).
    output_format: str = "aiff"


def _default_output_dir() -> Path:
    return Path(os.path.expanduser(os.getenv("GETIT_OUTPUT_DIR", "~/Music/getit")))


def load_settings(db: Database) -> Settings:
    stored = {row["key"]: row["value"] for row in db.query("SELECT key, value FROM settings")}
    settings = Settings(output_dir=_default_output_dir())
    if stored.get("output_dir"):
        settings.output_dir = Path(os.path.expanduser(stored["output_dir"]))
    if stored.get("filename_pattern"):
        settings.filename_pattern = stored["filename_pattern"]
    if stored.get("concurrency", "").isdigit():
        settings.concurrency = max(1, min(MAX_CONCURRENCY, int(stored["concurrency"])))
    if "dry_run" in stored:
        settings.dry_run = stored["dry_run"] == "1"
    return settings


def save_settings(db: Database, settings: Settings) -> None:
    values = {
        "output_dir": str(settings.output_dir),
        "filename_pattern": settings.filename_pattern,
        "concurrency": str(max(1, min(MAX_CONCURRENCY, settings.concurrency))),
        "dry_run": "1" if settings.dry_run else "0",
    }
    for key, value in values.items():
        db.execute(
            "INSERT INTO settings(key, value) VALUES(?, ?) "
            "ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (key, value),
        )
