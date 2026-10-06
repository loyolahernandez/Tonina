"""Puntaje de candidatos de YouTube para un tema con metadata conocida (PRD §4)."""

import re
from dataclasses import replace

from getit.naming import primary_artist, simplify
from getit.sources.base import Candidate

# Si el mejor candidato no llega a este puntaje, el tema queda en 'review'.
REVIEW_THRESHOLD = 60

# Versiones que casi nunca son lo que se busca, salvo que el original las mencione.
PENALTY_TERMS = [
    "live",
    "en vivo",
    "sped up",
    "speed up",
    "slowed",
    "remix",
    "cover",
    "karaoke",
    "8d",
    "nightcore",
    "reverb",
    "instrumental",
    "reaction",
]


def _contains(haystack: str, term: str) -> bool:
    return re.search(rf"\b{re.escape(term)}\b", haystack) is not None


def score_candidate(artist: str, title: str, duration: int | None, candidate: Candidate) -> float:
    target_title = simplify(title)
    target_artist = simplify(primary_artist(artist))
    cand_title = simplify(candidate.title)
    cand_channel = simplify(candidate.channel)
    score = 0.0

    if target_artist and target_artist in cand_channel:
        # "Artista - Topic" es el audio oficial de YouTube Music: lo mejor posible.
        score += 40 if candidate.channel.lower().endswith(" - topic") else 25

    if duration and candidate.duration:
        diff = abs(duration - candidate.duration)
        if diff <= 5:
            score += 30
        elif diff <= 15:
            score += 10
        elif diff > 30:
            score -= 20

    title_tokens = target_title.split()
    if title_tokens:
        found = sum(1 for token in title_tokens if _contains(cand_title, token))
        score += 30 * found / len(title_tokens)

    if target_artist and (target_artist in cand_title or target_artist in cand_channel):
        score += 10

    for term in PENALTY_TERMS:
        if _contains(cand_title, term) and not _contains(target_title, term):
            score -= 40

    return round(score, 1)


def rank_candidates(
    artist: str, title: str, duration: int | None, candidates: list[Candidate]
) -> list[Candidate]:
    scored = [
        replace(c, score=score_candidate(artist, title, duration, c)) for c in candidates
    ]
    return sorted(scored, key=lambda c: c.score or 0, reverse=True)


def needs_review(ranked: list[Candidate]) -> bool:
    return not ranked or (ranked[0].score or 0) < REVIEW_THRESHOLD
