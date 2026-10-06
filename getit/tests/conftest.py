import shutil
import struct
from pathlib import Path

import pytest

from getit.config import Settings
from getit.db import Database
from getit.library import Library

HAS_FFMPEG = shutil.which("ffmpeg") is not None


def write_silent_aiff(path: Path, frames: int = 4410) -> Path:
    """AIFF PCM 16-bit estéreo 44.1 kHz mínimo, sin depender de ffmpeg."""
    channels, bits = 2, 16
    sample_rate_80bit = b"\x40\x0e\xac\x44\x00\x00\x00\x00\x00\x00"  # 44100 en extended
    comm = struct.pack(">hIh", channels, frames, bits) + sample_rate_80bit
    sound = b"\x00" * (frames * channels * bits // 8)
    ssnd = struct.pack(">II", 0, 0) + sound
    body = b"AIFF" + b"COMM" + struct.pack(">I", len(comm)) + comm + b"SSND" + struct.pack(">I", len(ssnd)) + ssnd
    path.write_bytes(b"FORM" + struct.pack(">I", len(body)) + body)
    return path


@pytest.fixture
def db(tmp_path):
    database = Database(tmp_path / "test.db")
    yield database
    database.close()


@pytest.fixture
def library(db):
    return Library(db)


@pytest.fixture
def settings(tmp_path):
    return Settings(output_dir=tmp_path / "out")
