"""Tests for offline_bake.sample_narratives (Task 19)."""

from __future__ import annotations

import json
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

from offline_bake.sample_narratives import (
    _uniform_sample_frames,
    sample_narratives,
    sample_narratives_windowed,
)


def test_sample_narratives_writes_json(sample_clips_dir: Path) -> None:
    """Run narrative sampling with fake pipeline and verify per-clip JSON output."""
    with tempfile.TemporaryDirectory() as td:
        out_json = Path(td) / "narratives.json"
        sample_narratives(
            clips_dir=sample_clips_dir,
            output_json=out_json,
            use_fake_pipeline=True,
        )
        assert out_json.exists(), "narratives JSON was not created"
        data = json.loads(out_json.read_text())
        assert len(data) > 0, "expected at least one clip result"
        for stem, result in data.items():
            assert "text" in result, f"clip {stem} missing 'text'"
            assert "confidence" in result, f"clip {stem} missing 'confidence'"
            assert isinstance(result["text"], str)
            assert result["text"] != ""


def test_sample_narratives_legacy_fake_flag(sample_clips_dir: Path) -> None:
    """Verify the legacy use_fake_narrative kwarg still works."""
    with tempfile.TemporaryDirectory() as td:
        out_json = Path(td) / "narratives_legacy.json"
        sample_narratives(
            clips_dir=sample_clips_dir,
            output_json=out_json,
            use_fake_narrative=True,  # legacy alias
        )
        assert out_json.exists()
        data = json.loads(out_json.read_text())
        assert len(data) > 0


def test_uniform_sample_frames_returns_k_items() -> None:
    xs = list(range(100))
    out = _uniform_sample_frames(xs, 6)
    assert len(out) == 6
    assert out[0] == 0
    assert out[-1] < 100


def test_uniform_sample_frames_handles_small_input() -> None:
    assert _uniform_sample_frames([1, 2], 6) == [1, 2]


def test_windowed_emits_per_window_entries(tmp_path: Path) -> None:
    fake_frames = [(i, MagicMock(name=f"frame_{i}")) for i in range(180)]
    fake_narr = MagicMock()
    fake_narr.describe.return_value = MagicMock(text="cat drinks", confidence=0.88)

    with (
        patch("offline_bake.sample_narratives.iter_frames", return_value=iter(fake_frames)),
        patch("offline_bake._fakes.FakeNarr", return_value=fake_narr, create=True),
    ):
        from offline_bake import _fakes

        _fakes.FakeNarr = MagicMock(return_value=fake_narr)  # type: ignore[attr-defined]

        result = sample_narratives_windowed(
            input_video=tmp_path / "nope.mp4",
            max_frames=180,
            fps=30.0,
            use_fake_pipeline=True,
            window_frames=60,
            frames_per_window=6,
        )

    assert len(result) == 3
    assert all(set(r.keys()) == {"frame", "time_s", "text", "confidence"} for r in result)
    assert result[0]["time_s"] == round(59 / 30.0, 2)
    assert result[0]["confidence"] == 0.88
