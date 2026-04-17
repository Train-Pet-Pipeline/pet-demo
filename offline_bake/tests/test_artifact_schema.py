"""Two-sided schema guard (Python half).

Drift in the golden fixture shape vs these dataclasses will trip this test;
the mirrored TS test in frontends/apps/dashboard will trip on the other side.
"""

from pathlib import Path

import dacite
import pytest

from offline_bake.artifact_schema import (
    ArtifactGolden,
    Benchmarks,
    Clip,
    parse_golden,
)

GOLDEN_PATH = Path(__file__).resolve().parents[2] / "tests" / "fixtures" / "artifact-golden.json"


def test_golden_fixture_parses() -> None:
    result = parse_golden(GOLDEN_PATH)
    assert isinstance(result, ArtifactGolden)
    assert "clip_1" in result.narratives
    assert isinstance(result.narratives["clip_1"], Clip)
    assert isinstance(result.benchmarks, Benchmarks)


def test_clip_1_narratives_shape() -> None:
    result = parse_golden(GOLDEN_PATH)
    clip = result.narratives["clip_1"]
    assert clip.video.endswith(".mp4")
    assert clip.poster.endswith(".jpg")
    assert len(clip.narratives) >= 1
    n0 = clip.narratives[0]
    assert isinstance(n0.frame, int)
    assert isinstance(n0.time_s, float)
    assert isinstance(n0.text, str)
    assert 0.0 <= n0.confidence <= 1.0


def test_benchmarks_has_pipeline_mode() -> None:
    result = parse_golden(GOLDEN_PATH)
    assert result.benchmarks.pipeline_mode in ("parallel", "serial")
    assert result.benchmarks.mean_fps > 0


def test_missing_required_field_raises() -> None:
    import json
    import tempfile

    bad = {"narratives": {}, "benchmarks": {"mean_fps": 1.0}}  # incomplete
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        json.dump(bad, f)
        path = Path(f.name)

    with pytest.raises((dacite.exceptions.MissingValueError, KeyError, Exception)):
        parse_golden(path)
