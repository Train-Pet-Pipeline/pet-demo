"""Tests for offline_bake.generate_overlays (Task 18)."""

from __future__ import annotations

import tempfile
from pathlib import Path

from offline_bake.generate_overlays import render_overlays_from_pipeline_results


def test_render_overlays_produces_mp4(sample_video: Path) -> None:
    """Render 10 frames with fake pipeline and verify a non-empty mp4 is produced."""
    with tempfile.TemporaryDirectory() as td:
        out_path = Path(td) / "out.mp4"
        render_overlays_from_pipeline_results(
            input_video=sample_video,
            output_video=out_path,
            max_frames=10,
            use_fake_pipeline=True,
        )
        assert out_path.exists(), "output mp4 was not created"
        assert out_path.stat().st_size > 0, "output mp4 is empty"
