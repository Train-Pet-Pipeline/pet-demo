"""Generate overlay videos for landing/dashboard assets."""

from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np
from purrai_core.config import load_config
from purrai_core.pipelines.full_pipeline import FullPipeline
from purrai_core.types import PoseResult, Track
from purrai_core.utils.video_io import iter_frames, read_metadata


def _draw_track(frame: np.ndarray, track: Track) -> None:
    """Draw bounding box and track label onto frame in-place."""
    x1, y1, x2, y2 = map(int, [track.bbox.x1, track.bbox.y1, track.bbox.x2, track.bbox.y2])
    cv2.rectangle(frame, (x1, y1), (x2, y2), (62, 93, 198), 2)
    cv2.putText(
        frame,
        f"ID {track.track_id} {track.class_name}",
        (x1, max(y1 - 8, 10)),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (62, 93, 198),
        2,
    )


def _draw_pose(frame: np.ndarray, pose: PoseResult) -> None:
    """Draw keypoint circles onto frame in-place."""
    for kp in pose.keypoints:
        cv2.circle(frame, (int(kp.x), int(kp.y)), 3, (64, 93, 62), -1)


def render_overlays_from_pipeline_results(
    input_video: Path,
    output_video: Path,
    max_frames: int | None = None,
    config_path: Path | None = None,
    use_fake_pipeline: bool = False,
) -> None:
    """Read input_video, run pipeline on each frame, write annotated output_video.

    Args:
        input_video: Path to source video file.
        output_video: Destination path for annotated mp4.
        max_frames: Cap on frames to process; None means all.
        config_path: Path to params.yaml (required when use_fake_pipeline=False).
        use_fake_pipeline: Use FakeDet/FakeTr/... instead of real models.
    """
    md = read_metadata(input_video)
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")  # type: ignore[attr-defined]
    writer = cv2.VideoWriter(str(output_video), fourcc, md.fps, (md.width, md.height))
    try:
        if use_fake_pipeline:
            pipeline = _build_fake_pipeline()
        else:
            assert config_path is not None, "--config is required without --use-fake-pipeline"
            pipeline = _build_real_pipeline(load_config(config_path))
        for idx, frame in iter_frames(input_video, max_frames):
            result = pipeline.process_frame(frame, idx)
            for t in result.tracks:
                _draw_track(frame, t)
            for pose in result.poses:
                _draw_pose(frame, pose)
            if result.narrative is not None:
                cv2.putText(
                    frame,
                    result.narrative.text[:40],
                    (10, md.height - 20),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (31, 26, 23),
                    2,
                )
            writer.write(frame)
    finally:
        writer.release()


def _build_fake_pipeline() -> FullPipeline:
    """Construct a FullPipeline backed entirely by fake implementations."""
    from offline_bake._fakes import FakeDet, FakeNarr, FakePose, FakeReid, FakeTr

    return FullPipeline(
        FakeDet(),
        FakeTr(),
        FakeReid(),
        FakePose(),
        FakeNarr(),
        vlm_trigger_interval_frames=60,
    )


def _build_real_pipeline(cfg: object) -> FullPipeline:
    """Construct a FullPipeline backed by production model backends."""
    from typing import Any

    from purrai_core.backends.bytetrack_tracker import ByteTrackTracker
    from purrai_core.backends.mmpose_pose import MMPosePoseEstimator
    from purrai_core.backends.osnet_reid import OSNetReid
    from purrai_core.backends.qwen2vl_narrative import Qwen2VLNarrative
    from purrai_core.backends.yolov10_detector import YOLOv10Detector

    cfg_any: Any = cfg
    assert hasattr(cfg_any, "section"), "cfg must be a Config object from load_config()"
    sec = cfg_any.section
    return FullPipeline(
        detector=YOLOv10Detector(sec("detector")),
        tracker=ByteTrackTracker(sec("tracker")),
        reid=OSNetReid(sec("reid")),
        pose=MMPosePoseEstimator(sec("pose")),
        narrative=Qwen2VLNarrative(sec("narrative")),
        vlm_trigger_interval_frames=int(sec("pipeline")["vlm_trigger_interval_frames"]),
    )


def main() -> None:
    """CLI entry point for generate_overlays."""
    p = argparse.ArgumentParser(description="Render pipeline overlay video from source footage.")
    p.add_argument("--input", type=Path, required=True, help="Input video path.")
    p.add_argument("--output", type=Path, required=True, help="Output annotated mp4 path.")
    p.add_argument("--max-frames", type=int, default=None, help="Max frames to process.")
    p.add_argument(
        "--use-fake-pipeline",
        action="store_true",
        help="Use offline_bake._fakes instead of real models (smoke test / CI).",
    )
    p.add_argument(
        "--config",
        type=Path,
        default=Path(__file__).parent.parent / "core" / "params.yaml",
        help="Path to params.yaml.",
    )
    args = p.parse_args()
    render_overlays_from_pipeline_results(
        input_video=args.input,
        output_video=args.output,
        max_frames=args.max_frames,
        use_fake_pipeline=args.use_fake_pipeline,
        config_path=args.config,
    )


if __name__ == "__main__":
    main()
