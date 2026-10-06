import pytest

from getit.naming import (
    clean_title,
    format_duration,
    normalize_key,
    render_filename,
    safe_filename,
    split_artist_title,
)


@pytest.mark.parametrize(
    "raw, expected",
    [
        ("Los Flamencos - Luna Roja (Official Video)", "Los Flamencos - Luna Roja"),
        ("Los Flamencos - Luna Roja [Official Music Video] [HD]", "Los Flamencos - Luna Roja"),
        ("Los Flamencos - Luna Roja (Lyrics)", "Los Flamencos - Luna Roja"),
        ("Los Flamencos - Luna Roja (Video Oficial)", "Los Flamencos - Luna Roja"),
        ("Los Flamencos - Luna Roja | Official Audio", "Los Flamencos - Luna Roja"),
        ("Los Flamencos - Luna Roja (Audio)", "Los Flamencos - Luna Roja"),
        ("Los Flamencos - Luna Roja - Official Video", "Los Flamencos - Luna Roja"),
        ("Luna Roja (Extended Mix)", "Luna Roja (Extended Mix)"),
        ("Luna Roja (feat. Ana Tijoux) [Official Video]", "Luna Roja (feat. Ana Tijoux)"),
        ("Luna Roja (Radio Edit)", "Luna Roja (Radio Edit)"),
        ("(Official Video)", "(Official Video)"),
    ],
)
def test_clean_title(raw, expected):
    assert clean_title(raw) == expected


def test_split_artist_title_from_separator():
    assert split_artist_title("Kuervos - Noche Larga (Official Video)", "KuervosVEVO") == ("Kuervos", "Noche Larga")


def test_split_artist_title_topic_channel():
    assert split_artist_title("Noche Larga", "Kuervos - Topic") == ("Kuervos", "Noche Larga")


def test_split_artist_title_falls_back_to_channel():
    assert split_artist_title("Noche Larga [HD]", "Kuervos Official") == ("Kuervos", "Noche Larga")


def test_normalize_key_ignores_accents_noise_and_feat():
    a = normalize_key("Mon Laferte, Otro", "Canción Única (feat. Alguien) [Official Video]")
    b = normalize_key("mon laferte & otro", "Cancion Unica")
    assert a == b == "mon laferte|cancion unica"


def test_normalize_key_keeps_version():
    assert normalize_key("X", "Tema (Extended Mix)") != normalize_key("X", "Tema")


def test_safe_filename():
    assert safe_filename('AC/DC: "Back"?  ') == "AC DC Back"
    assert safe_filename("...") == "Sin titulo"
    assert len(safe_filename("a" * 500)) == 180


def test_render_filename_accepts_spanish_and_english_keys():
    assert render_filename("{artist} - {title}", "A", "B") == "A - B.aiff"
    assert render_filename("{artista} - {título}", "A", "B/C") == "A - B C.aiff"


def test_format_duration():
    assert format_duration(185) == "3:05"
    assert format_duration(None) == "–"
