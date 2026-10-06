import json

import pytest

from getit.sources import SourceError, detect_source, resolve_link, spotify, youtube


def test_detect_source():
    assert detect_source("https://music.youtube.com/watch?v=abcdefghijk") is youtube
    assert detect_source("https://youtu.be/abcdefghijk") is youtube
    assert detect_source("https://open.spotify.com/intl-es/track/4uLU6hMCjMI75M1A2tKUQC?si=x") is spotify
    assert detect_source("spotify:playlist:37i9dQZF1DXcBWIGoYBM5M") is spotify
    assert detect_source("https://soundcloud.com/a/b") is None


def test_unsupported_link_message():
    with pytest.raises(SourceError, match="no lo soporto"):
        resolve_link("https://soundcloud.com/a/b")


def test_video_id_from_url():
    assert youtube.video_id_from_url("https://www.youtube.com/watch?v=abcdefghijk&list=RDxyz") == "abcdefghijk"
    assert youtube.video_id_from_url("https://youtu.be/abcdefghijk?t=3") == "abcdefghijk"
    assert youtube.video_id_from_url("https://www.youtube.com/shorts/abcdefghijk") == "abcdefghijk"
    assert youtube.video_id_from_url("https://www.youtube.com/playlist?list=PL123") is None


def test_humanize_error():
    assert "403" in youtube.humanize_error("ERROR: unable to download video data: HTTP Error 403: Forbidden")
    assert youtube.humanize_error("ERROR: [youtube] abc: Video unavailable") == "El video no está disponible."
    assert youtube.humanize_error("ERROR: algo raro").startswith("Error de YouTube: algo raro")


def test_spotify_parse_link():
    assert spotify.parse_link("https://open.spotify.com/album/1A2B3c?si=1") == ("album", "1A2B3c")
    assert spotify.parse_link("https://example.com/track/1") is None


def _embed_html(entity):
    data = {"props": {"pageProps": {"state": {"data": {"entity": entity}}}}}
    return f'<html><script id="__NEXT_DATA__" type="application/json">{json.dumps(data)}</script></html>'


def test_spotify_embed_playlist():
    entity = {
        "name": "Para el sábado",
        "trackList": [
            {"uri": "spotify:track:111", "title": "Noche Larga", "subtitle": "Kuervos, Otra", "duration": 210500},
            {"uri": "spotify:episode:222", "title": "Podcast", "subtitle": "x", "duration": 1},
        ],
    }
    resolved = spotify.parse_embed_html("playlist", "abc", _embed_html(entity))
    assert resolved.title == "Para el sábado"
    assert len(resolved.tracks) == 1
    track = resolved.tracks[0]
    assert (track.artist, track.title, track.duration, track.spotify_id) == ("Kuervos, Otra", "Noche Larga", 210, "111")
    assert track.cover_url is None


def test_spotify_embed_track():
    entity = {
        "name": "Noche Larga",
        "artists": [{"name": "Kuervos"}],
        "duration": 210000,
        "releaseDate": {"isoString": "2024-05-01T00:00:00Z"},
        "visualIdentity": {"image": [{"url": "small", "maxWidth": 64}, {"url": "big", "maxWidth": 640}]},
    }
    track = spotify.parse_embed_html("track", "111", _embed_html(entity)).tracks[0]
    assert (track.artist, track.year, track.cover_url) == ("Kuervos", "2024", "big")


def test_spotify_embed_changed_format():
    with pytest.raises(SourceError):
        spotify.parse_embed_html("track", "1", "<html></html>")


def test_spotify_without_credentials_uses_embed(monkeypatch):
    monkeypatch.delenv("SPOTIFY_CLIENT_ID", raising=False)
    monkeypatch.delenv("SPOTIFY_CLIENT_SECRET", raising=False)

    def fail(kind, item_id):
        raise SourceError("Spotify respondió 404.")

    monkeypatch.setattr(spotify, "_resolve_embed", fail)
    with pytest.raises(SourceError, match="No hay credenciales"):
        spotify.resolve("https://open.spotify.com/playlist/abc")
