import subprocess

import pytest
from mutagen.aiff import AIFF

from conftest import HAS_FFMPEG, write_silent_aiff
from getit import pipeline

TRACK = {"artist": "Kuervos", "title": "Noche Larga", "album": "Disco", "year": "2024",
         "youtube_id": "abcdefghijk", "cover_url": None}


@pytest.fixture
def fake_network(monkeypatch):
    """Sin red: la 'descarga' genera un AIFF local y la carátula es un JPEG falso."""

    def download_audio(youtube_id, work):
        return write_silent_aiff(work / "source.aiff"), 129.5

    def convert(source, destination):
        destination.write_bytes(source.read_bytes())

    monkeypatch.setattr(pipeline, "download_audio", download_audio)
    monkeypatch.setattr(pipeline, "convert_to_aiff", convert)
    monkeypatch.setattr(pipeline, "fetch_cover", lambda url, yid, work: b"\xff\xd8\xff\xe0fakejpeg")


def test_process_track_writes_tagged_aiff(fake_network, settings, library):
    result = pipeline.process_track(TRACK, settings, library)
    assert result.file_path == settings.output_dir / "Kuervos - Noche Larga.aiff"
    assert result.source_bitrate == 129.5
    tags = AIFF(result.file_path).tags
    assert str(tags["TPE1"]) == "Kuervos"
    assert str(tags["TIT2"]) == "Noche Larga"
    assert str(tags["TALB"]) == "Disco"
    assert str(tags["TDRC"]) == "2024"
    assert tags.getall("APIC")[0].data.startswith(b"\xff\xd8")
    assert "youtube:abcdefghijk" in str(tags.getall("COMM")[0])
    # Nada a medio escribir queda en la carpeta de salida.
    assert not list((settings.output_dir / pipeline.TMP_DIR_NAME).iterdir())
    assert library.find_duplicate("abcdefghijk", "x|y") is not None


def test_second_download_is_skipped(fake_network, settings, library):
    pipeline.process_track(TRACK, settings, library)
    with pytest.raises(pipeline.SkipError, match="Ya descargaste"):
        pipeline.process_track(TRACK, settings, library)


def test_never_overwrites_existing_file(fake_network, settings, library):
    settings.output_dir.mkdir(parents=True)
    existing = settings.output_dir / "Kuervos - Noche Larga.aiff"
    existing.write_bytes(b"mio")
    with pytest.raises(pipeline.SkipError, match="Ya existe un archivo"):
        pipeline.process_track(TRACK, settings, library)
    assert existing.read_bytes() == b"mio"


def test_failure_leaves_no_partial_file(monkeypatch, settings, library):
    def boom(youtube_id, work):
        (work / "source.webm").write_bytes(b"partial")
        raise pipeline.PipelineError("El video no está disponible.")

    monkeypatch.setattr(pipeline, "download_audio", boom)
    with pytest.raises(pipeline.PipelineError):
        pipeline.process_track(TRACK, settings, library)
    assert [p.name for p in settings.output_dir.iterdir()] == [pipeline.TMP_DIR_NAME]
    assert not list((settings.output_dir / pipeline.TMP_DIR_NAME).iterdir())
    # El candado se libera: se puede reintentar.
    assert library.find_duplicate("abcdefghijk", "kuervos|noche larga") is None


def test_move_without_overwrite_fallback_without_hardlinks(monkeypatch, tmp_path):
    source, target = tmp_path / "a.aiff", tmp_path / "b.aiff"
    source.write_bytes(b"x")

    def no_links(src, dst):
        raise OSError(45, "Operation not supported")

    monkeypatch.setattr(pipeline.os, "link", no_links)
    pipeline.move_without_overwrite(source, target)
    assert target.read_bytes() == b"x" and not source.exists()


@pytest.mark.skipif(not HAS_FFMPEG, reason="requiere ffmpeg")
def test_convert_to_aiff_with_real_ffmpeg(tmp_path):
    source = tmp_path / "tone.m4a"
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-f", "lavfi", "-i", "sine=frequency=440:duration=1",
         "-ac", "1", "-ar", "48000", "-c:a", "aac", str(source)],
        check=True,
    )
    destination = tmp_path / "out.aiff"
    pipeline.convert_to_aiff(source, destination)
    info = AIFF(destination).info
    assert (info.sample_rate, info.bits_per_sample, info.channels) == (44100, 16, 2)
