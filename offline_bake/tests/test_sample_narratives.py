"""Tests for offline_bake.sample_narratives (Task 19)."""

from __future__ import annotations

import json
import tempfile
from pathlib import Path

from offline_bake.sample_narratives import sample_narratives


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
