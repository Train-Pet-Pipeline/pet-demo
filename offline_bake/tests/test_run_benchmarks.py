"""Tests for offline_bake.run_benchmarks (Task 19)."""

from __future__ import annotations

import json
import tempfile
from pathlib import Path

from offline_bake.run_benchmarks import run_benchmarks


def test_run_benchmarks_writes_json(sample_video: Path) -> None:
    """Run benchmark with fake pipeline and verify expected JSON keys are present."""
    with tempfile.TemporaryDirectory() as td:
        out_json = Path(td) / "bench.json"
        run_benchmarks(
            input_video=sample_video,
            output_json=out_json,
            max_frames=10,
            use_fake_pipeline=True,
        )
        assert out_json.exists(), "benchmark JSON was not created"
        data = json.loads(out_json.read_text())
        expected_keys = {
            "mean_fps",
            "detector_ms",
            "tracker_ms",
            "reid_ms",
            "pose_ms",
            "narrative_ms",
            "total_frames",
            "total_seconds",
        }
        assert expected_keys <= data.keys(), f"missing keys: {expected_keys - data.keys()}"
        assert data["total_frames"] == 10
        assert data["mean_fps"] > 0
        assert data["detector_ms"] >= 0
        assert data["tracker_ms"] >= 0
        assert data["reid_ms"] >= 0
        assert data["pose_ms"] >= 0
