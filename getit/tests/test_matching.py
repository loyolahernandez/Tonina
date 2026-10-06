from getit.matching import REVIEW_THRESHOLD, needs_review, rank_candidates, score_candidate
from getit.sources.base import Candidate

ARTIST, TITLE, DURATION = "Kuervos", "Noche Larga", 210


def test_prefers_topic_channel():
    topic = Candidate("a" * 11, "Noche Larga", "Kuervos - Topic", 210)
    video = Candidate("b" * 11, "Kuervos - Noche Larga (Official Video)", "KuervosVEVO", 236)
    ranked = rank_candidates(ARTIST, TITLE, DURATION, [video, topic])
    assert ranked[0].youtube_id == topic.youtube_id
    assert not needs_review(ranked)


def test_penalizes_versions_not_in_original():
    sped = Candidate("c" * 11, "Kuervos - Noche Larga (sped up)", "fan", 180)
    assert score_candidate(ARTIST, TITLE, DURATION, sped) < REVIEW_THRESHOLD


def test_no_penalty_when_original_has_the_term():
    remix = Candidate("d" * 11, "Kuervos - Noche Larga (Remix)", "Kuervos - Topic", 300)
    plain = score_candidate(ARTIST, "Noche Larga", 300, remix)
    wanted = score_candidate(ARTIST, "Noche Larga (Remix)", 300, remix)
    assert wanted > plain


def test_duration_mismatch_lowers_score():
    close = Candidate("e" * 11, "Kuervos - Noche Larga", "otro", 212)
    far = Candidate("f" * 11, "Kuervos - Noche Larga", "otro", 400)
    assert score_candidate(ARTIST, TITLE, DURATION, close) > score_candidate(ARTIST, TITLE, DURATION, far)


def test_needs_review_when_empty_or_weak():
    assert needs_review([])
    weak = Candidate("g" * 11, "otra cosa", "nadie", 50, score=10)
    assert needs_review([weak])
