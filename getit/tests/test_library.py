from pathlib import Path

import pytest

from getit.library import DuplicateError


def test_lock_by_youtube_id(library):
    library.register("vid00000001", "a|b", Path("/x/A - B.aiff"))
    assert "Ya descargaste" in library.find_duplicate("vid00000001", "otro|tema")


def test_lock_by_normalized_key(library):
    library.register("vid00000001", "a|b", Path("/x/A - B.aiff"))
    assert "Ya tienes" in library.find_duplicate("vid00000002", "a|b")


def test_no_duplicate(library):
    assert library.find_duplicate("vid00000001", "a|b") is None


def test_claim_blocks_parallel_downloads(library):
    with library.claim("vid00000001", "a|b"):
        with pytest.raises(DuplicateError):
            with library.claim("vid00000001", "c|d"):
                pass
        with pytest.raises(DuplicateError):
            with library.claim("vid00000002", "a|b"):
                pass
    with library.claim("vid00000001", "a|b"):
        pass
