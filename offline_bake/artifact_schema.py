"""Artifact JSON schema (Python side).

Mirrors frontends/apps/dashboard/lib/schemas.ts.  Both sides parse the same
tests/fixtures/artifact-golden.json in CI; field drift on either side fails
the corresponding test and forces two-sided sync.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

import dacite


@dataclass
class Narrative:
    frame: int
    time_s: float
    text: str
    confidence: float


@dataclass
class Clip:
    video: str
    poster: str
    label: str
    narratives: list[Narrative]


@dataclass
class Benchmarks:
    mean_fps: float
    detector_ms: float
    tracker_ms: float
    reid_ms: float
    pose_ms: float
    narrative_ms: float
    pipeline_ms: float
    pipeline_mode: str
    total_frames: int
    total_seconds: float


@dataclass
class ArtifactGolden:
    narratives: dict[str, Clip]
    benchmarks: Benchmarks


def parse_narratives(raw: dict[str, Any]) -> dict[str, Clip]:
    """Parse the narratives.json payload (map of clip_id -> Clip)."""
    return {k: dacite.from_dict(Clip, v) for k, v in raw.items()}


def parse_benchmarks(raw: dict[str, Any]) -> Benchmarks:
    """Parse the benchmarks.json payload."""
    return dacite.from_dict(Benchmarks, raw)


def parse_golden(path: Path) -> ArtifactGolden:
    """Parse the shared golden fixture used by both TS and Python test suites."""
    import json

    data = json.loads(path.read_text())
    return ArtifactGolden(
        narratives=parse_narratives(data["narratives"]),
        benchmarks=parse_benchmarks(data["benchmarks"]),
    )
