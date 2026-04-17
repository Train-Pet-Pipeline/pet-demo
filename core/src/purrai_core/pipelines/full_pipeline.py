"""Full-stack pipeline combining all interfaces."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from purrai_core.interfaces.detector import Detector
from purrai_core.interfaces.narrative import NarrativeGenerator
from purrai_core.interfaces.pose import PoseEstimator
from purrai_core.interfaces.reid import ReidEncoder
from purrai_core.interfaces.tracker import Tracker
from purrai_core.types import Detection, NarrativeOutput, PoseResult, ReidEmbedding, Track


@dataclass
class PipelineResult:
    """Result produced by one call to FullPipeline.process_frame()."""

    frame_idx: int
    detections: list[Detection]
    tracks: list[Track]
    embeddings: list[ReidEmbedding]
    poses: list[PoseResult]
    narrative: NarrativeOutput | None
    narrative_frame_idx: int | None = None


class FullPipeline:
    """Compose detect → track → reid → pose → (event-triggered) narrative."""

    def __init__(
        self,
        detector: Detector,
        tracker: Tracker,
        reid: ReidEncoder,
        pose: PoseEstimator,
        narrative: NarrativeGenerator,
        vlm_trigger_interval_frames: int = 60,
    ) -> None:
        """Initialise pipeline with all five backend instances.

        Args:
            detector: Single-frame object detector.
            tracker: Stateful multi-object tracker.
            reid: Re-identification encoder.
            pose: Skeletal keypoint estimator.
            narrative: VLM-backed natural-language summariser.
            vlm_trigger_interval_frames: Narrative is generated every N frames
                (frame_idx > 0 and frame_idx % N == 0).
        """
        self.detector = detector
        self.tracker = tracker
        self.reid = reid
        self.pose = pose
        self.narrative = narrative
        self.vlm_interval = vlm_trigger_interval_frames
        self._frame_buffer: list[np.ndarray] = []
        self._tracks_history: list[list[Track]] = []

    def process_frame(self, frame: np.ndarray, frame_idx: int) -> PipelineResult:
        """Run the full pipeline for one frame.

        Steps: detect → track → reid → pose → (interval-triggered) narrative.

        Args:
            frame: BGR uint8 image array of shape (H, W, 3).
            frame_idx: Zero-based frame counter from the caller.

        Returns:
            PipelineResult with all intermediate outputs and optional narrative.
        """
        dets: list[Detection] = self.detector.detect(frame)
        # Pass frame to tracker so real trackers (ByteTrack via boxmot) get the image.
        tracks: list[Track] = self.tracker.update(dets, frame_idx, frame=frame)
        embs: list[ReidEmbedding] = self.reid.encode(frame, tracks)
        poses: list[PoseResult] = self.pose.estimate(frame, tracks)

        self._frame_buffer.append(frame)
        self._tracks_history.append(tracks)

        # Keep buffer bounded to the trigger window.
        if len(self._frame_buffer) > self.vlm_interval:
            self._frame_buffer = self._frame_buffer[-self.vlm_interval :]
            self._tracks_history = self._tracks_history[-self.vlm_interval :]

        narr: NarrativeOutput | None = None
        if frame_idx > 0 and frame_idx % self.vlm_interval == 0:
            narr = self.narrative.describe(self._frame_buffer, self._tracks_history)

        return PipelineResult(
            frame_idx=frame_idx,
            detections=dets,
            tracks=tracks,
            embeddings=embs,
            poses=poses,
            narrative=narr,
            narrative_frame_idx=frame_idx if narr is not None else None,
        )

    def shutdown(self) -> None:
        """Release background workers. No-op in Task 1; real behavior added in Task 3."""
        return None

    def reset(self) -> None:
        """Clear frame buffer, tracks history, and reset the tracker.

        Useful when switching to a new video clip without reinstantiating backends.
        """
        self._frame_buffer = []
        self._tracks_history = []
        self.tracker.reset()
