"""Tests for bake_from_yaml orchestrator.

Heavy work (video decode + full pipeline) is mocked via the internal seams:
_render_overlays / _write_poster / _generate_narratives / _run_benchmarks.
We assert config parsing, aggregation shape, low-confidence warnings, and the
output file layout that the Dashboard expects.
"""

from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import patch

import pytest

from offline_bake.bake_from_yaml import ClipConfig, bake_all, load_config


def _fake_overlays(*, input_video, output_video, max_frames, config_path, use_fake_pipeline):
    Path(output_video).write_bytes(b"fake mp4 bytes")


def _fake_poster(*, source, output):
    Path(output).write_bytes(b"fake jpg bytes")


def _fake_narratives_windowed(
    *,
    input_video,
    max_frames,
    fps,
    use_fake_pipeline,
    config_path,
    window_frames,
    frames_per_window,
):
    return [
        {"frame": 60, "time_s": 2.0, "text": "bark", "confidence": 0.9},
        {"frame": 120, "time_s": 4.0, "text": "low-conf item", "confidence": 0.4},
    ]


def _fake_bench(*, source, max_frames, config_path, use_fake_pipeline):
    return {
        "mean_fps": 27.0,
        "detector_ms": 8.0,
        "tracker_ms": 1.0,
        "reid_ms": 6.0,
        "pose_ms": 5.0,
        "narrative_ms": 1800.0,
        "pipeline_ms": 18.0,
        "pipeline_mode": "parallel",
        "total_frames": 300,
        "total_seconds": 10.0,
    }


def test_load_config_parses_curated_clips(tmp_path: Path) -> None:
    yaml_text = """
version: "0.2.0"
conf_warn_threshold: 0.6
narrative_window_frames: 60
narrative_frames_per_window: 6
clips:
  - id: a
    source: /nonexistent/a.mp4
    label: A
    max_frames: 30
"""
    p = tmp_path / "c.yaml"
    p.write_text(yaml_text)
    cfg = load_config(p)
    assert cfg.version == "0.2.0"
    assert cfg.conf_warn_threshold == 0.6
    assert cfg.narrative_window_frames == 60
    assert cfg.narrative_frames_per_window == 6
    assert len(cfg.clips) == 1
    assert isinstance(cfg.clips[0], ClipConfig)
    assert cfg.clips[0].max_frames == 30


def test_bake_all_writes_top_level_aggregates(tmp_path: Path) -> None:
    src = tmp_path / "fake.mp4"
    src.write_bytes(b"x")
    cfg_file = tmp_path / "c.yaml"
    cfg_file.write_text(f"""
version: "0.2.0"
conf_warn_threshold: 0.6
narrative_window_frames: 60
narrative_frames_per_window: 6
clips:
  - id: c1
    source: {src}
    label: L1
    max_frames: 180
""")
    out = tmp_path / "out"

    with (
        patch("offline_bake.bake_from_yaml._render_overlays", side_effect=_fake_overlays),
        patch("offline_bake.bake_from_yaml._write_poster", side_effect=_fake_poster),
        patch("offline_bake.bake_from_yaml._video_fps", return_value=30.0),
        patch(
            "offline_bake.bake_from_yaml._generate_narratives",
            side_effect=_fake_narratives_windowed,
        ),
        patch("offline_bake.bake_from_yaml._run_benchmarks", side_effect=_fake_bench),
    ):
        bake_all(cfg_file, out, bench_frames=300, use_fake_pipeline=True, config_path=None)

    assert (out / "overlays" / "c1.mp4").exists()
    assert (out / "posters" / "c1.jpg").exists()
    narratives = json.loads((out / "narratives.json").read_text())
    assert "c1" in narratives
    assert narratives["c1"]["video"] == "overlays/c1.mp4"
    assert narratives["c1"]["poster"] == "posters/c1.jpg"
    assert narratives["c1"]["label"] == "L1"
    assert len(narratives["c1"]["narratives"]) == 2
    bench = json.loads((out / "benchmarks.json").read_text())
    assert bench["pipeline_mode"] == "parallel"


def test_bake_all_warns_on_low_confidence(tmp_path: Path, capsys) -> None:
    src = tmp_path / "fake.mp4"
    src.write_bytes(b"x")
    cfg_file = tmp_path / "c.yaml"
    cfg_file.write_text(f"""
version: "0.2.0"
conf_warn_threshold: 0.6
narrative_window_frames: 60
narrative_frames_per_window: 6
clips:
  - id: c1
    source: {src}
    label: L1
    max_frames: 180
""")
    out = tmp_path / "out"
    with (
        patch("offline_bake.bake_from_yaml._render_overlays", side_effect=_fake_overlays),
        patch("offline_bake.bake_from_yaml._write_poster", side_effect=_fake_poster),
        patch("offline_bake.bake_from_yaml._video_fps", return_value=30.0),
        patch(
            "offline_bake.bake_from_yaml._generate_narratives",
            side_effect=_fake_narratives_windowed,
        ),
        patch("offline_bake.bake_from_yaml._run_benchmarks", side_effect=_fake_bench),
    ):
        bake_all(cfg_file, out, bench_frames=300, use_fake_pipeline=True, config_path=None)
    captured = capsys.readouterr()
    assert "low-conf item" in captured.err or "0.4" in captured.err


def test_missing_source_raises(tmp_path: Path) -> None:
    cfg_file = tmp_path / "c.yaml"
    cfg_file.write_text("""
version: "0.2.0"
conf_warn_threshold: 0.6
narrative_window_frames: 60
narrative_frames_per_window: 6
clips:
  - id: c1
    source: /definitely/does/not/exist.mp4
    label: L1
    max_frames: 30
""")
    with pytest.raises(FileNotFoundError):
        bake_all(
            cfg_file, tmp_path / "out", bench_frames=300, use_fake_pipeline=True, config_path=None
        )
