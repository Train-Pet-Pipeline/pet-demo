"""Fake backends used by offline_bake tests and --use-fake-pipeline CLI mode.

Per project policy (feedback_pet_demo_autonomy.md): this is the ONLY allowed
Fake backend set. It powers local/CI smoke tests and the CLI `--use-fake-pipeline`
flag. Never import these from core/ or production code paths.
"""

from __future__ import annotations

import numpy as np
from purrai_core.types import (
    BBox,
    Detection,
    NarrativeOutput,
    PoseResult,
    ReidEmbedding,
    Track,
)


class FakeDet:
    """Fake detector returning a single cat detection."""

    def detect(self, frame: np.ndarray) -> list[Detection]:
        """Return one fixed detection."""
        return [Detection(BBox(10, 10, 100, 100), 0.9, 15, "cat")]


class FakeTr:
    """Fake tracker that wraps detections into tracks."""

    def update(
        self,
        dets: list[Detection],
        frame_idx: int,
        frame: np.ndarray | None = None,
    ) -> list[Track]:
        """Wrap each detection as a track."""
        return [Track(1, d.bbox, d.score, d.class_id, d.class_name) for d in dets]

    def reset(self) -> None:
        """No-op reset."""


class FakeReid:
    """Fake Re-ID encoder returning unit embeddings."""

    def encode(self, frame: np.ndarray, tracks: list[Track]) -> list[ReidEmbedding]:
        """Return a 512-dim fixed embedding for each track."""
        return [ReidEmbedding(t.track_id, (0.1,) * 512) for t in tracks]

    def match_identity(self, embedding: ReidEmbedding, gallery: list[ReidEmbedding]) -> int | None:
        """Always return no match."""
        return None


class FakePose:
    """Fake pose estimator returning empty keypoints."""

    def estimate(self, frame: np.ndarray, tracks: list[Track]) -> list[PoseResult]:
        """Return a pose result with no keypoints for each track."""
        return [PoseResult(t.track_id, []) for t in tracks]


class FakeNarr:
    """Fake narrative generator returning a fixed Chinese string."""

    def describe(
        self, frames: list[np.ndarray], tracks_history: list[list[Track]]
    ) -> NarrativeOutput:
        """Return a fixed narrative."""
        return NarrativeOutput(text="猫正在观察周围", confidence=0.9)
