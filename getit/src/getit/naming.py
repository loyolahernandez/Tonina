"""Limpieza de títulos de YouTube, claves de deduplicación y nombres de archivo."""

import re
import unicodedata

# Fragmentos que YouTube agrega al título y que no son parte del tema.
# Un paréntesis/corchete se elimina solo si TODO su contenido es ruido,
# así "(Extended Mix)" o "(feat. X)" se conservan.
_NOISE_PATTERNS = [
    r"official\s+(?:music\s+)?video",
    r"official\s+(?:lyric\s+)?video",
    r"official\s+audio",
    r"official\s+visuali[sz]er",
    r"lyric\s+video",
    r"lyrics?",
    r"con\s+letra",
    r"letra",
    r"video\s+oficial",
    r"videoclip\s+oficial",
    r"video\s*clip",
    r"audio\s+oficial",
    r"audio",
    r"visuali[sz]er",
    r"official",
    r"oficial",
    r"hd",
    r"hq",
    r"4k",
    r"remastered\s+in\s+4k",
    r"m/?v",
]
_NOISE_RE = [re.compile(rf"\b{p}\b", re.IGNORECASE) for p in _NOISE_PATTERNS]
_BRACKETS_RE = re.compile(r"[\(\[\{【]([^\)\]\}】]*)[\)\]\}】]")
_SEPARATORS = (" - ", " – ", " — ", " -- ", " ~ ")
_FEAT_RE = re.compile(r"[\(\[]?\s*\b(?:feat|ft|featuring)\b\.?\s+[^\)\]]*[\)\]]?", re.IGNORECASE)
_ARTIST_SPLIT_RE = re.compile(r"\s*(?:,|&|\band\b|\by\b|\bx\b|\bfeat\b\.?|\bft\b\.?|\bvs\b\.?)\s*", re.IGNORECASE)
_FORBIDDEN_CHARS_RE = re.compile(r'[\\/:*?"<>|\x00-\x1f]')


def _is_noise(text: str) -> bool:
    remaining = text
    for pattern in _NOISE_RE:
        remaining = pattern.sub(" ", remaining)
    return not re.sub(r"[\s/&+\-|,.:]+", "", remaining)


def _collapse(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip(" -–—|~·")


def clean_title(title: str) -> str:
    """Quita "(Official Video)", "[HD]", "| Lyrics", etc. y deja el resto intacto."""
    text = _BRACKETS_RE.sub(lambda m: " " if _is_noise(m.group(1)) else m.group(0), title)

    parts = text.split("|")
    text = " | ".join([parts[0]] + [p for p in parts[1:] if not _is_noise(p)])

    segments = re.split(r"\s+[-–—]\s+", text)
    while len(segments) > 1 and _is_noise(segments[-1]):
        segments.pop()
    text = " - ".join(segments)

    cleaned = _collapse(text)
    return cleaned or _collapse(title)


def strip_channel_suffix(channel: str) -> str:
    """'Daft Punk - Topic' → 'Daft Punk', 'DaftPunkVEVO' → 'DaftPunk'."""
    channel = channel.strip()
    channel = re.sub(r"\s+-\s+topic$", "", channel, flags=re.IGNORECASE)
    channel = re.sub(r"\s*vevo$", "", channel, flags=re.IGNORECASE)
    channel = re.sub(r"\s+(?:official|oficial)$", "", channel, flags=re.IGNORECASE)
    return channel.strip()


def split_artist_title(video_title: str, channel: str) -> tuple[str, str]:
    """Deduce (artista, título) a partir del título de un video y su canal."""
    cleaned = clean_title(video_title)
    if channel.strip().lower().endswith(" - topic"):
        return strip_channel_suffix(channel), cleaned
    for sep in _SEPARATORS:
        if sep in cleaned:
            artist, title = cleaned.split(sep, 1)
            if artist.strip() and title.strip():
                return _collapse(artist), _collapse(title)
    return strip_channel_suffix(channel) or "Desconocido", cleaned


def strip_accents(text: str) -> str:
    decomposed = unicodedata.normalize("NFKD", text)
    return "".join(c for c in decomposed if not unicodedata.combining(c))


def simplify(text: str) -> str:
    """Minúsculas, sin acentos, sin puntuación, espacios simples."""
    text = strip_accents(text).lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def primary_artist(artist: str) -> str:
    first = _ARTIST_SPLIT_RE.split(artist.strip(), maxsplit=1)[0]
    return first or artist


def normalize_key(artist: str, title: str) -> str:
    """Clave de deduplicación (candado 2): primer artista + título sin ruido ni 'feat.'.

    Conserva la versión ("Extended Mix", "Remix"): para un DJ son temas distintos.
    """
    core_title = _FEAT_RE.sub(" ", clean_title(title))
    return f"{simplify(primary_artist(artist))}|{simplify(core_title)}"


def safe_filename(name: str, max_length: int = 180) -> str:
    name = unicodedata.normalize("NFC", name)
    name = _FORBIDDEN_CHARS_RE.sub(" ", name)
    name = re.sub(r"\s+", " ", name).strip(" .")
    if len(name) > max_length:
        name = name[:max_length].rstrip(" .")
    return name or "Sin titulo"


def render_filename(pattern: str, artist: str, title: str, extension: str = "aiff") -> str:
    """Aplica el patrón de nombre. Acepta {artist}/{title} o {artista}/{título}/{titulo}."""
    values = {
        "artist": artist,
        "artista": artist,
        "title": title,
        "titulo": title,
        "título": title,
    }

    def replace(match: re.Match) -> str:
        return values.get(match.group(1).lower(), "")

    rendered = re.sub(r"\{([^{}]+)\}", replace, pattern)
    return f"{safe_filename(rendered)}.{extension}"


def format_duration(seconds: int | float | None) -> str:
    if not seconds:
        return "–"
    seconds = int(round(seconds))
    return f"{seconds // 60}:{seconds % 60:02d}"
