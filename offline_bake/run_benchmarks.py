"""Measure end-to-end FPS and per-stage latency on a sample video."""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

from purrai_core.config import load_config
from purrai_core.utils.video_io import iter_frames


def run_benchmarks(
    input_video: Path,
    output_json: Path,
    max_frames: int | None = None,
    use_fake_pipeline: bool = False,
    config_path: Path | None = None,
) -> None:
    """Run each pipeline stage individually, timing each with perf_counter_ns.

    Args:
        input_video: Source video to benchmark against.
        output_json: Destination JSON file for benchmark results.
        max_frames: Cap on frames to process; None means all.
        use_fake_pipeline: Use FakeDet/FakeTr/... instead of real models.
        config_path: Path to params.yaml (required when use_fake_pipeline=False).
    """
    if use_fake_pipeline:
        from offline_bake._fakes import FakeDet, FakeNarr, FakePose, FakeReid, FakeTr

        det, tr, reid, pose, narr = FakeDet(), FakeTr(), FakeReid(), FakePose(), FakeNarr()
    else:
        assert config_path is not None, "--config is required without --use-fake-pipeline"
        cfg = load_config(config_path)
        from purrai_core.backends.bytetrack_tracker import ByteTrackTracker
        from purrai_core.backends.mmpose_pose import MMPosePoseEstimator
        from purrai_core.backends.osnet_reid import OSNetReid
        from purrai_core.backends.qwen2vl_narrative import Qwen2VLNarrative
        from purrai_core.backends.yolov10_detector import YOLOv10Detector

        det = YOLOv10Detector(cfg.section("detector"))
        tr = ByteTrackTracker(cfg.section("tracker"))
        reid = OSNetReid(cfg.section("reid"))
        pose = MMPosePoseEstimator(cfg.section("pose"))
        narr = Qwen2VLNarrative(cfg.section("narrative"))

    det_ms: list[float] = []
    tr_ms: list[float] = []
    reid_ms: list[float] = []
    pose_ms: list[float] = []
    narr_ms: list[float] = []
    frames_buf: list[object] = []
    tracks_hist: list[object] = []

    t0 = time.perf_counter()
    count = 0

    for idx, frame in iter_frames(input_video, max_frames):
        s = time.perf_counter_ns()
        dets = det.detect(frame)
        det_ms.append((time.perf_counter_ns() - s) / 1e6)

        s = time.perf_counter_ns()
        tracks = tr.update(dets, idx, frame=frame)
        tr_ms.append((time.perf_counter_ns() - s) / 1e6)

        s = time.perf_counter_ns()
        _ = reid.encode(frame, tracks)
        reid_ms.append((time.perf_counter_ns() - s) / 1e6)

        s = time.perf_counter_ns()
        _ = pose.estimate(frame, tracks)
        pose_ms.append((time.perf_counter_ns() - s) / 1e6)

        frames_buf.append(frame)
        tracks_hist.append(tracks)
        if idx > 0 and idx % 60 == 0:
            s = time.perf_counter_ns()
            _ = narr.describe(frames_buf[-60:], tracks_hist[-60:])  # type: ignore[arg-type]
            narr_ms.append((time.perf_counter_ns() - s) / 1e6)

        count += 1

    total = time.perf_counter() - t0

    def _mean(xs: list[float]) -> float:
        return sum(xs) / len(xs) if xs else 0.0

    data = {
        "mean_fps": count / total if total > 0 else 0.0,
        "detector_ms": _mean(det_ms),
        "tracker_ms": _mean(tr_ms),
        "reid_ms": _mean(reid_ms),
        "pose_ms": _mean(pose_ms),
        "narrative_ms": _mean(narr_ms),
        "total_frames": count,
        "total_seconds": total,
    }
    output_json.write_text(json.dumps(data, indent=2))


def main() -> None:
    """CLI entry point for run_benchmarks."""
    p = argparse.ArgumentParser(description="Benchmark per-stage pipeline latency on a video.")
    p.add_argument("--input", type=Path, required=True, help="Input video path.")
    p.add_argument("--output", type=Path, required=True, help="Output JSON path.")
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
    run_benchmarks(
        input_video=args.input,
        output_json=args.output,
        max_frames=args.max_frames,
        use_fake_pipeline=args.use_fake_pipeline,
        config_path=args.config,
    )


if __name__ == "__main__":
    main()
