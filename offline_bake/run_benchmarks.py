"""Measure end-to-end FPS and per-stage latency on a sample video."""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

from purrai_core.config import load_config
from purrai_core.pipelines.full_pipeline import FullPipeline
from purrai_core.utils.video_io import iter_frames


def _build_backends(
    use_fake_pipeline: bool,
    config_path: Path | None,
) -> tuple[object, object, object, object, object, str, bool]:
    """Build the 5 backends + return (backends..., pipeline_mode, parallel_reid_pose).

    Args:
        use_fake_pipeline: When True, returns offline_bake._fakes instances.
        config_path: Path to params.yaml (required when use_fake_pipeline=False).

    Returns:
        Tuple of (det, tr, reid, pose, narr, pipeline_mode, parallel_reid_pose).
    """
    if use_fake_pipeline:
        from offline_bake._fakes import FakeDet, FakeNarr, FakePose, FakeReid, FakeTr

        return FakeDet(), FakeTr(), FakeReid(), FakePose(), FakeNarr(), "fake", True
    assert config_path is not None, "--config required without --use-fake-pipeline"
    cfg = load_config(config_path)
    from purrai_core.backends.bytetrack_tracker import ByteTrackTracker
    from purrai_core.backends.mmpose_pose import MMPosePoseEstimator
    from purrai_core.backends.osnet_reid import OSNetReid
    from purrai_core.backends.qwen2vl_narrative import Qwen2VLNarrative
    from purrai_core.backends.yolov10_detector import YOLOv10Detector

    parallel = bool(cfg.section("pipeline").get("parallel_reid_pose", True))
    mode = "parallel" if parallel else "serial"
    return (
        YOLOv10Detector(cfg.section("detector")),
        ByteTrackTracker(cfg.section("tracker")),
        OSNetReid(cfg.section("reid")),
        MMPosePoseEstimator(cfg.section("pose")),
        Qwen2VLNarrative(cfg.section("narrative")),
        mode,
        parallel,
    )


def run_benchmarks(
    input_video: Path,
    output_json: Path,
    max_frames: int | None = None,
    use_fake_pipeline: bool = False,
    config_path: Path | None = None,
) -> None:
    """Benchmark per-stage AND end-to-end FullPipeline latency.

    Args:
        input_video: Source video.
        output_json: Destination JSON.
        max_frames: Cap; None = all.
        use_fake_pipeline: Use offline_bake._fakes.
        config_path: Path to params.yaml (required unless use_fake_pipeline).
    """
    det, tr, reid, pose, narr, pipeline_mode, parallel = _build_backends(
        use_fake_pipeline, config_path
    )

    # --- Pass 1: per-stage diagnostic timings ---
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
        dets = det.detect(frame)  # type: ignore[attr-defined]
        det_ms.append((time.perf_counter_ns() - s) / 1e6)

        s = time.perf_counter_ns()
        tracks = tr.update(dets, idx, frame=frame)  # type: ignore[attr-defined]
        tr_ms.append((time.perf_counter_ns() - s) / 1e6)

        s = time.perf_counter_ns()
        _ = reid.encode(frame, tracks)  # type: ignore[attr-defined]
        reid_ms.append((time.perf_counter_ns() - s) / 1e6)

        s = time.perf_counter_ns()
        _ = pose.estimate(frame, tracks)  # type: ignore[attr-defined]
        pose_ms.append((time.perf_counter_ns() - s) / 1e6)

        frames_buf.append(frame)
        tracks_hist.append(tracks)
        if idx > 0 and idx % 60 == 0:
            s = time.perf_counter_ns()
            _ = narr.describe(frames_buf[-60:], tracks_hist[-60:])  # type: ignore[attr-defined]
            narr_ms.append((time.perf_counter_ns() - s) / 1e6)

        count += 1

    total = time.perf_counter() - t0

    # --- Pass 2: end-to-end FullPipeline measurement ---
    pipeline = FullPipeline(
        detector=det,
        tracker=tr,
        reid=reid,
        pose=pose,
        narrative=narr,
        vlm_trigger_interval_frames=60,
        parallel_reid_pose=parallel,
    )
    pipeline_ms_list: list[float] = []
    try:
        tr.reset()  # type: ignore[attr-defined]
        for idx, frame in iter_frames(input_video, max_frames):
            s = time.perf_counter_ns()
            pipeline.process_frame(frame, idx)
            pipeline_ms_list.append((time.perf_counter_ns() - s) / 1e6)
    finally:
        pipeline.shutdown()

    def _mean(xs: list[float]) -> float:
        return sum(xs) / len(xs) if xs else 0.0

    data = {
        "mean_fps": count / total if total > 0 else 0.0,
        "detector_ms": _mean(det_ms),
        "tracker_ms": _mean(tr_ms),
        "reid_ms": _mean(reid_ms),
        "pose_ms": _mean(pose_ms),
        "narrative_ms": _mean(narr_ms),
        "pipeline_ms": _mean(pipeline_ms_list),
        "pipeline_mode": pipeline_mode,
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
