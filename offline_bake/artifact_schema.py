"""Artifact JSON schema (Python side).

Mirrors frontends/apps/dashboard/lib/schemas.ts.  Both sides parse the same
tests/fixtures/artifact-golden.json in CI; field drift on either side fails
the corresponding test and forces two-sided sync.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, List, Optional

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


# ---------------------------------------------------------------------------
# M4 Playground dataclasses
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class TrackFrameEntry:
    """A single tracked object within one frame."""

    id: int
    bbox: List[int]  # [x1, y1, x2, y2] top-left to bottom-right corners
    score: float


@dataclass(frozen=True)
class TrackFrame:
    """All tracks for a single video timestamp."""

    t: float
    tracks: List[TrackFrameEntry]


@dataclass(frozen=True)
class TracksManifest:
    """Full per-frame tracking output for a clip."""

    fps: int
    frames: List[TrackFrame]


@dataclass(frozen=True)
class PoseFrameEntry:
    """Pose keypoints for one tracked animal in one frame."""

    id: int
    keypoints: List[List[float]]  # 17 × [x, y, conf]


@dataclass(frozen=True)
class PoseFrame:
    """All pose results for a single video timestamp."""

    t: float
    poses: List[PoseFrameEntry]


@dataclass(frozen=True)
class PosesManifest:
    """Full per-frame pose output for a clip."""

    fps: int
    schema: str  # e.g. "ap10k-17"
    frames: List[PoseFrame]


@dataclass(frozen=True)
class Chapter:
    """A narrative chapter segment."""

    start: float
    end: float
    text: str
    confidence: float


@dataclass(frozen=True)
class ChapteredNarratives:
    """Ordered list of narrative chapters for a clip."""

    chapters: List[Chapter]


@dataclass(frozen=True)
class M4ClipManifest:
    """Metadata manifest for an M4 Playground clip."""

    slug: str
    title: str
    source: str  # "ai_generated" | "real_footage"
    duration_s: float
    chapter_count: int
    width: int
    height: int
    tags: List[str]


def parse_tracks(payload: dict) -> TracksManifest:
    """Parse a tracks JSON payload into a TracksManifest."""
    return dacite.from_dict(TracksManifest, payload)


def parse_poses(payload: dict) -> PosesManifest:
    """Parse a poses JSON payload into a PosesManifest."""
    return dacite.from_dict(PosesManifest, payload)


def parse_chaptered_narratives(payload: dict) -> ChapteredNarratives:
    """Parse a chaptered narratives JSON payload into a ChapteredNarratives."""
    return dacite.from_dict(ChapteredNarratives, payload)
