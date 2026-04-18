"""Bake curated clips into dashboard artifacts.

Reads curated_clips.yaml; for each clip: renders overlay mp4, extracts a
poster frame, generates windowed narratives. Also runs a single benchmark
pass on clips[0] and writes aggregated narratives.json + benchmarks.json at
the output root. Low-confidence narratives warned to stderr so operators
can swap clips.
"""

from __future__ import annotations

import json
import sys
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

import cv2
import yaml


@dataclass
class ClipConfig:
    id: str
    source: Path
    label: str
    max_frames: int
    notes: str = ""


@dataclass
class BakeConfig:
    version: str
    conf_warn_threshold: float
    narrative_window_frames: int
    narrative_frames_per_window: int
    clips: list[ClipConfig] = field(default_factory=list)


def load_config(path: Path) -> BakeConfig:
    """Parse curated_clips.yaml into a BakeConfig."""
    raw = yaml.safe_load(path.read_text())
    clips = [
        ClipConfig(
            id=c["id"],
            source=Path(c["source"]),
            label=c["label"],
            max_frames=int(c["max_frames"]),
            notes=c.get("notes", ""),
        )
        for c in raw.get("clips", [])
    ]
    return BakeConfig(
        version=str(raw["version"]),
        conf_warn_threshold=float(raw.get("conf_warn_threshold", 0.6)),
        narrative_window_frames=int(raw.get("narrative_window_frames", 60)),
        narrative_frames_per_window=int(raw.get("narrative_frames_per_window", 6)),
        clips=clips,
    )


def _render_overlays(
    *,
    input_video: Path,
    output_video: Path,
    max_frames: int,
    config_path: Path | None,
    use_fake_pipeline: bool,
) -> None:
    from offline_bake.generate_overlays import render_overlays_from_pipeline_results

    render_overlays_from_pipeline_results(
        input_video=input_video,
        output_video=output_video,
        max_frames=max_frames,
        config_path=config_path,
        use_fake_pipeline=use_fake_pipeline,
    )


def _write_poster(*, source: Path, output: Path) -> None:
    cap = cv2.VideoCapture(str(source))
    try:
        ok, frame = cap.read()
        if not ok or frame is None:
            raise RuntimeError(f"failed to read first frame of {source}")
        output.parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(str(output), frame)
    finally:
        cap.release()


def _generate_narratives(
    *,
    input_video: Path,
    max_frames: int,
    fps: float,
    use_fake_pipeline: bool,
    config_path: Path | None,
    window_frames: int,
    frames_per_window: int,
) -> list[dict]:
    from offline_bake.sample_narratives import sample_narratives_windowed

    return sample_narratives_windowed(
        input_video=input_video,
        max_frames=max_frames,
        fps=fps,
        use_fake_pipeline=use_fake_pipeline,
        config_path=config_path,
        window_frames=window_frames,
        frames_per_window=frames_per_window,
    )


def _run_benchmarks(
    *,
    source: Path,
    max_frames: int,
    config_path: Path | None,
    use_fake_pipeline: bool,
) -> dict:
    """Wrap run_benchmarks() via tempfile since it writes JSON and returns None."""
    from offline_bake.run_benchmarks import run_benchmarks

    with tempfile.NamedTemporaryFile(mode="r", suffix=".json", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        run_benchmarks(
            input_video=source,
            output_json=tmp_path,
            max_frames=max_frames,
            use_fake_pipeline=use_fake_pipeline,
            config_path=config_path,
        )
        return json.loads(tmp_path.read_text())
    finally:
        tmp_path.unlink(missing_ok=True)


def _video_fps(path: Path) -> float:
    cap = cv2.VideoCapture(str(path))
    try:
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        return float(fps)
    finally:
        cap.release()


def bake_all(
    config_path_yaml: Path,
    out_dir: Path,
    bench_frames: int,
    *,
    use_fake_pipeline: bool = False,
    config_path: Path | None = None,
) -> None:
    """Bake every clip in curated_clips.yaml into out_dir."""
    cfg = load_config(config_path_yaml)
    for c in cfg.clips:
        if not c.source.exists():
            raise FileNotFoundError(f"clip source missing: {c.source}")

    (out_dir / "overlays").mkdir(parents=True, exist_ok=True)
    (out_dir / "posters").mkdir(parents=True, exist_ok=True)

    narratives_agg: dict[str, dict] = {}
    for c in cfg.clips:
        mp4_out = out_dir / "overlays" / f"{c.id}.mp4"
        jpg_out = out_dir / "posters" / f"{c.id}.jpg"
        _render_overlays(
            input_video=c.source,
            output_video=mp4_out,
            max_frames=c.max_frames,
            config_path=config_path,
            use_fake_pipeline=use_fake_pipeline,
        )
        _write_poster(source=c.source, output=jpg_out)

        fps = _video_fps(c.source) or 30.0
        clip_narratives = _generate_narratives(
            input_video=c.source,
            max_frames=c.max_frames,
            fps=fps,
            use_fake_pipeline=use_fake_pipeline,
            config_path=config_path,
            window_frames=cfg.narrative_window_frames,
            frames_per_window=cfg.narrative_frames_per_window,
        )
        for n in clip_narratives:
            conf = float(n.get("confidence", 0.0))
            if conf < cfg.conf_warn_threshold:
                print(
                    f"[warn] {c.id}: low-confidence narrative '{n.get('text')}' "
                    f"({conf:.2f} < {cfg.conf_warn_threshold}); consider swapping clip",
                    file=sys.stderr,
                )
        narratives_agg[c.id] = {
            "video": f"overlays/{c.id}.mp4",
            "poster": f"posters/{c.id}.jpg",
            "label": c.label,
            "narratives": clip_narratives,
        }

    (out_dir / "narratives.json").write_text(
        json.dumps(narratives_agg, ensure_ascii=False, indent=2)
    )

    first_clip = cfg.clips[0]
    bench = _run_benchmarks(
        source=first_clip.source,
        max_frames=bench_frames,
        config_path=config_path,
        use_fake_pipeline=use_fake_pipeline,
    )
    (out_dir / "benchmarks.json").write_text(json.dumps(bench, ensure_ascii=False, indent=2))


def main() -> None:
    """CLI entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Bake curated clips")
    parser.add_argument("--clips", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--bench-frames", type=int, default=300)
    parser.add_argument("--use-fake-pipeline", action="store_true")
    parser.add_argument(
        "--config",
        type=Path,
        default=None,
        help="purrai_core params.yaml path (passed through)",
    )
    args = parser.parse_args()

    bake_all(
        args.clips,
        args.output,
        args.bench_frames,
        use_fake_pipeline=args.use_fake_pipeline,
        config_path=args.config,
    )


if __name__ == "__main__":
    main()
