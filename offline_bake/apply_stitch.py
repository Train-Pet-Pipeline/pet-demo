"""CLI shell around purrai_core.stitch.stitch_tracks for existing bundles.

Reads tracks.json + reids.json from --bundle dir, writes tracks.stitched.json.
Both consumers (this CLI and bake_m4) call the same pure function.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

import yaml
from purrai_core.stitch import stitch_tracks
from purrai_core.types import BBox, Track

log = logging.getLogger(__name__)


def _load_tracks(path: Path) -> tuple[int, list[tuple[int, list[Track]]]]:
    """Load tracks.json into (fps, [(frame_idx, [Track, ...]), ...])."""
    payload = json.loads(path.read_text())
    fps = int(payload["fps"])
    out: list[tuple[int, list[Track]]] = []
    for frame in payload["frames"]:
        t_s = float(frame["t"])
        frame_idx = int(round(t_s * fps))
        trs: list[Track] = []
        for entry in frame["tracks"]:
            bx, by, bw, bh = entry["bbox"]
            trs.append(
                Track(
                    track_id=int(entry["id"]),
                    bbox=BBox(float(bx), float(by), float(bx + bw), float(by + bh)),
                    score=float(entry["score"]),
                    class_id=0,
                    class_name="",
                )
            )
        out.append((frame_idx, trs))
    return fps, out


def _load_reids(path: Path) -> list[tuple[int, dict[int, list[float]]]]:
    """Load reids.json into [(frame_idx, {track_id: [float, ...]}), ...]."""
    payload = json.loads(path.read_text())
    return [
        (int(f["frame_idx"]), {int(k): list(v) for k, v in f["embeddings"].items()})
        for f in payload["frames"]
    ]


def _dump_tracks(fps: int, stitched: list[tuple[int, list[Track]]], path: Path) -> None:
    """Dump stitched tracks back to the same shape as tracks.json."""
    frames = []
    for frame_idx, trs in stitched:
        t = round(frame_idx / fps, 4)
        frames.append(
            {
                "t": t,
                "tracks": [
                    {
                        "id": tr.track_id,
                        "bbox": [
                            int(round(tr.bbox.x1)),
                            int(round(tr.bbox.y1)),
                            int(round(tr.bbox.x2 - tr.bbox.x1)),
                            int(round(tr.bbox.y2 - tr.bbox.y1)),
                        ],
                        "score": round(tr.score, 4),
                    }
                    for tr in trs
                ],
            }
        )
    path.write_text(json.dumps({"fps": fps, "frames": frames}))


def _load_stitch_cfg(params_path: Path) -> dict:
    """Load just the `stitch` section from params.yaml."""
    cfg = yaml.safe_load(params_path.read_text())
    if "stitch" not in cfg:
        raise KeyError(f"{params_path}: missing 'stitch' section")
    return cfg["stitch"]


def main(argv: list[str] | None = None) -> int:
    """Entry point for the apply_stitch CLI."""
    parser = argparse.ArgumentParser(
        prog="python -m offline_bake.apply_stitch",
        description="Post-process an existing bundle's tracks.json + reids.json "
        "into tracks.stitched.json using render-time id stitching.",
    )
    parser.add_argument(
        "--bundle",
        type=Path,
        required=True,
        help="Bundle dir containing tracks.json and reids.json",
    )
    parser.add_argument(
        "--params",
        type=Path,
        default=Path("core/params.yaml"),
        help="Path to params.yaml (reads stitch.* section)",
    )
    args = parser.parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    tracks_path = args.bundle / "tracks.json"
    reids_path = args.bundle / "reids.json"
    if not tracks_path.exists():
        log.error("missing %s", tracks_path)
        return 2
    if not reids_path.exists():
        log.error("missing %s", reids_path)
        return 2

    fps, tracks = _load_tracks(tracks_path)
    reids = _load_reids(reids_path)
    cfg = _load_stitch_cfg(args.params)

    stitched = stitch_tracks(
        tracks,
        reids,
        cosine_threshold=float(cfg["cosine_threshold"]),
        max_gap_frames=int(cfg["max_gap_frames"]),
        embedding_window=int(cfg["embedding_window"]),
    )

    out_path = args.bundle / "tracks.stitched.json"
    _dump_tracks(fps, stitched, out_path)
    log.info("wrote %s", out_path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
