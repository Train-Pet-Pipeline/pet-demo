"""Tests for AP-10K skeleton edge provider."""

from __future__ import annotations

import pytest

from offline_bake._pose_skeleton import AP10K_FALLBACK_EDGES, get_edges


def test_fallback_edges_are_nonempty_and_valid() -> None:
    """Fallback edge list covers the AP-10K skeleton (>= 15 edges)."""
    assert len(AP10K_FALLBACK_EDGES) >= 15
    for a, b in AP10K_FALLBACK_EDGES:
        assert 0 <= a < 17
        assert 0 <= b < 17
        assert a != b


def test_get_edges_returns_list_of_pairs() -> None:
    """get_edges() returns a non-empty list of (int, int) tuples."""
    edges = get_edges()
    assert len(edges) >= 15
    for a, b in edges:
        assert isinstance(a, int)
        assert isinstance(b, int)


def test_get_edges_falls_back_when_mmpose_unavailable(monkeypatch: pytest.MonkeyPatch) -> None:
    """If mmpose import raises, get_edges() returns the fallback list."""
    import offline_bake._pose_skeleton as mod

    def _raise() -> list[tuple[int, int]]:
        raise ImportError("mmpose not available")

    monkeypatch.setattr(mod, "_edges_from_mmpose", _raise)
    edges = get_edges()
    assert edges == list(AP10K_FALLBACK_EDGES)
