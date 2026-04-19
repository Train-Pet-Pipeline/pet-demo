"""Rebuild narratives.json for one or more baked bundles without re-running
detector/tracker/pose. Useful for iterating on the VLM (prompt tweaks,
multi-frame sampling, different model) while keeping the heavy artifacts intact.

Usage:
    python -m offline_bake.rebuild_narratives <yaml_path> <out_dir> [--params PATH]
"""
from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path

from offline_bake.bake_m4 import _build_real_vlm_call, _load_yaml, _probe_duration
from offline_bake.chapter_narratives import build_chaptered_narratives

log = logging.getLogger(__name__)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("yaml_path", type=Path)
    ap.add_argument("out_dir", type=Path)
    ap.add_argument("--params", type=Path, default=Path("core/params.yaml"))
    args = ap.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    from offline_bake.generate_overlays import _build_real_pipeline
    from purrai_core.config import load_config

    cfg = load_config(args.params)
    pipeline = _build_real_pipeline(cfg)
    try:
        vlm_call = _build_real_vlm_call(pipeline)
        for clip in _load_yaml(args.yaml_path):
            bundle = args.out_dir / clip.slug
            raw = bundle / "raw.mp4"
            if not raw.exists():
                log.warning("skip %s: no raw.mp4", clip.slug)
                continue
            duration = _probe_duration(raw)
            narr = build_chaptered_narratives(
                video_path=str(raw),
                chapters=clip.chapters,
                vlm_call=vlm_call,
                full_duration_s=duration,
            )
            (bundle / "narratives.json").write_text(json.dumps(narr, ensure_ascii=False))
            log.info("rebuilt %s → %d chapters", clip.slug, len(narr["chapters"]))
    finally:
        pipeline.shutdown()


if __name__ == "__main__":
    main()
