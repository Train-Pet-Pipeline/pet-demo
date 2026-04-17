"""Sample narrative VLM output for a directory of .mp4 clips."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from purrai_core.config import load_config
from purrai_core.utils.video_io import iter_frames


def sample_narratives(
    clips_dir: Path,
    output_json: Path,
    use_fake_pipeline: bool = False,
    use_fake_narrative: bool | None = None,  # legacy alias for tests
    config_path: Path | None = None,
    frames_per_clip: int = 6,
) -> None:
    """Run narrative generation on each .mp4 clip in clips_dir and write results.

    Args:
        clips_dir: Directory containing .mp4 clip files.
        output_json: Destination JSON path for per-clip narrative results.
        use_fake_pipeline: Use FakeNarr instead of real VLM model.
        use_fake_narrative: Legacy alias for use_fake_pipeline; prefer use_fake_pipeline.
        config_path: Path to params.yaml (required when neither fake flag is set).
        frames_per_clip: Number of frames to sample per clip.
    """
    # Prefer use_fake_pipeline; accept legacy use_fake_narrative for older tests.
    use_fake = use_fake_pipeline or bool(use_fake_narrative)
    if use_fake:
        from offline_bake._fakes import FakeNarr

        narr: object = FakeNarr()
    else:
        assert config_path is not None, "--config is required without --use-fake-pipeline"
        cfg = load_config(config_path)
        from purrai_core.backends.qwen2vl_narrative import Qwen2VLNarrative

        narr = Qwen2VLNarrative(cfg.section("narrative"))

    data: dict[str, dict[str, object]] = {}
    for clip in sorted(clips_dir.glob("*.mp4")):
        frames = [f for _, f in iter_frames(clip, max_frames=frames_per_clip)]
        if not frames:
            continue
        out = narr.describe(frames, [[] for _ in frames])  # type: ignore[attr-defined]
        data[clip.stem] = {"text": out.text, "confidence": out.confidence}

    output_json.write_text(json.dumps(data, indent=2, ensure_ascii=False))


def main() -> None:
    """CLI entry point for sample_narratives."""
    p = argparse.ArgumentParser(description="Sample narrative VLM output for a clips directory.")
    p.add_argument("--clips-dir", type=Path, required=True, help="Directory of .mp4 clips.")
    p.add_argument("--output", type=Path, required=True, help="Output JSON path.")
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
    sample_narratives(
        clips_dir=args.clips_dir,
        output_json=args.output,
        use_fake_pipeline=args.use_fake_pipeline,
        config_path=args.config,
    )


if __name__ == "__main__":
    main()
