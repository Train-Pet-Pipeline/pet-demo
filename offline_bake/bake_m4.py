"""M4 Playground artifact orchestrator.

Reads a curated-clips YAML and, for each entry, produces a self-contained
per-slug bundle (raw.mp4, thumb.avif, tracks.json, poses.json,
narratives.json). Also emits a top-level manifest.json listing all bundles.

Uses `offline_bake.generate_overlays._build_fake_pipeline` /
`_build_real_pipeline` to build the FullPipeline — never duplicates that
construction.
"""
from __future__ import annotations

import datetime
import json
import logging
import subprocess
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

import ffmpeg
import yaml

from purrai_core.pipelines.full_pipeline import FullPipeline
from purrai_core.utils.video_io import iter_frames

from offline_bake.chapter_narratives import build_chaptered_narratives
from offline_bake.serializers import serialize_poses, serialize_tracks

log = logging.getLogger(__name__)

TARGET_FPS = 25
TARGET_W = 1280
TARGET_H = 720


@dataclass(frozen=True)
class ClipSpec:
    slug: str
    source_mp4: Path
    source: str
    title: str
    tags: list[str]
    chapters: list[tuple[float, float]] | None


def _load_yaml(yaml_path: Path) -> list[ClipSpec]:
    data = yaml.safe_load(yaml_path.read_text())
    clips: list[ClipSpec] = []
    for entry in data["clips"]:
        chapters: list[tuple[float, float]] | None = None
        if entry.get("chapters"):
            chapters = [(float(c["start"]), float(c["end"])) for c in entry["chapters"]]
        clips.append(ClipSpec(
            slug=entry["slug"],
            source_mp4=Path(entry["source_mp4"]),
            source=entry["source"],
            title=entry["title"],
            tags=list(entry.get("tags", [])),
            chapters=chapters,
        ))
    return clips


def _probe_duration(path: Path) -> float:
    info = ffmpeg.probe(str(path))
    return float(info["format"]["duration"])


def _normalize_raw(src: Path, dst: Path) -> None:
    (
        ffmpeg.input(str(src))
        .output(
            str(dst),
            vcodec="libx264",
            r=TARGET_FPS,
            s=f"{TARGET_W}x{TARGET_H}",
            pix_fmt="yuv420p",
            an=None,
            movflags="+faststart",
        )
        .overwrite_output()
        .run(quiet=True)
    )


def _extract_thumb(raw: Path, thumb: Path, at_s: float) -> None:
    # libsvtav1 is the widely-available AV1 encoder on ubuntu apt ffmpeg;
    # libaom-av1 is NOT guaranteed on CI runners.
    subprocess.run(
        [
            "ffmpeg", "-y", "-ss", f"{at_s:.3f}", "-i", str(raw),
            "-vframes", "1", "-c:v", "libsvtav1", "-crf", "40", str(thumb),
        ],
        check=True,
        capture_output=True,
    )


def _fake_vlm_call(video_path: str, start: float, end: float) -> tuple[str, float]:
    return (f"[fake narrative {start:.2f}-{end:.2f}]", 0.5)


def _run_pipeline_over_video(
    pipeline: FullPipeline, path: Path, fps: int = TARGET_FPS
) -> tuple[list[tuple[float, list]], list[tuple[float, list]]]:
    """Run the pipeline frame-by-frame and collect aligned track/pose timelines."""
    track_frames: list[tuple[float, list]] = []
    pose_frames: list[tuple[float, list]] = []
    for idx, frame in iter_frames(path, None):
        result = pipeline.process_frame(frame, idx)
        t = idx / fps
        track_frames.append((t, result.tracks))
        pose_frames.append((t, result.poses))
    return track_frames, pose_frames


VLM_FRAMES_PER_CHAPTER = 3


def _build_real_vlm_call(pipeline: FullPipeline) -> Callable[[str, float, float], tuple[str, float]]:
    """Build a per-chapter VLM call that samples VLM_FRAMES_PER_CHAPTER frames
    evenly across [start, end] and invokes the pipeline's NarrativeGenerator
    with all of them so the model sees temporal progression."""
    import cv2

    def vlm_call(video_path: str, start: float, end: float) -> tuple[str, float]:
        cap = cv2.VideoCapture(video_path)
        frames: list = []
        try:
            n = VLM_FRAMES_PER_CHAPTER
            for i in range(n):
                # Sample at (i+1)/(n+1) fractions: avoids hitting exact bounds.
                t = start + (end - start) * ((i + 1) / (n + 1))
                cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000)
                ok, frame = cap.read()
                if ok:
                    frames.append(frame)
        finally:
            cap.release()
        if not frames:
            return ("", 0.0)
        out = pipeline.narrative.describe(frames, tracks_history=[])
        conf = out.confidence if out.confidence is not None else 0.0
        return (out.text, float(conf))

    return vlm_call


def bake_m4_from_yaml(
    yaml_path: Path,
    *,
    out_dir: Path,
    use_fake_pipeline: bool = False,
    params_path: Path = Path("core/params.yaml"),
) -> None:
    """Bake all clips from the given YAML into per-slug bundles under out_dir."""
    out_dir.mkdir(parents=True, exist_ok=True)
    clips = _load_yaml(yaml_path)

    # Reuse existing helpers from generate_overlays — do not reinvent pipeline construction.
    from offline_bake.generate_overlays import _build_fake_pipeline, _build_real_pipeline

    vlm_call: Callable[[str, float, float], tuple[str, float]]
    if use_fake_pipeline:
        pipeline = _build_fake_pipeline()
        vlm_call = _fake_vlm_call
    else:
        from purrai_core.config import load_config
        cfg = load_config(params_path)
        pipeline = _build_real_pipeline(cfg)
        vlm_call = _build_real_vlm_call(pipeline)

    clips_info: list[dict] = []
    try:
        for clip in clips:
            bundle = out_dir / clip.slug
            bundle.mkdir(parents=True, exist_ok=True)
            raw_dst = bundle / "raw.mp4"
            _normalize_raw(clip.source_mp4, raw_dst)
            duration = _probe_duration(raw_dst)

            track_frames, pose_frames = _run_pipeline_over_video(pipeline, raw_dst)
            (bundle / "tracks.json").write_text(
                json.dumps(serialize_tracks(track_frames, fps=TARGET_FPS))
            )
            (bundle / "poses.json").write_text(
                json.dumps(serialize_poses(pose_frames, fps=TARGET_FPS))
            )

            narr = build_chaptered_narratives(
                video_path=str(raw_dst),
                chapters=clip.chapters,
                vlm_call=vlm_call,
                full_duration_s=duration,
            )
            (bundle / "narratives.json").write_text(json.dumps(narr))

            _extract_thumb(raw_dst, bundle / "thumb.avif", at_s=min(1.0, duration / 2))

            chapter_count = len(clip.chapters) if clip.chapters else 1
            clips_info.append({
                "slug": clip.slug,
                "title": clip.title,
                "source": clip.source,
                "duration_s": round(duration, 3),
                "chapter_count": chapter_count,
                "width": TARGET_W,
                "height": TARGET_H,
                "tags": clip.tags,
            })
    finally:
        pipeline.shutdown()
        manifest = {
            "version": "0.4.0",
            "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat().replace(
                "+00:00", "Z"
            ),
            "clips": clips_info,
        }
        (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2))


def _main() -> None:
    import argparse

    parser = argparse.ArgumentParser(
        prog="python -m offline_bake.bake_m4",
        description="Bake M4 curated-clips YAML into per-slug artifact bundles.",
    )
    parser.add_argument("yaml_path", type=Path, help="Path to curated-clips YAML")
    parser.add_argument("out_dir", type=Path, help="Output directory for bundles + manifest.json")
    parser.add_argument(
        "--use-fake-pipeline",
        action="store_true",
        help="Use Fake backends (no real detector/pose/VLM); smoke-test only",
    )
    parser.add_argument(
        "--params",
        type=Path,
        default=Path("core/params.yaml"),
        help="Path to params.yaml (override for CPU-only / non-CUDA hosts)",
    )
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    bake_m4_from_yaml(
        args.yaml_path,
        out_dir=args.out_dir,
        use_fake_pipeline=args.use_fake_pipeline,
        params_path=args.params,
    )


if __name__ == "__main__":
    _main()
