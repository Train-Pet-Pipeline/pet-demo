"""Render overlay mp4 from a baked artifact bundle (no pipeline re-run).

Reads raw.mp4 + tracks.json + poses.json + narratives.json from a bundle dir
and draws bbox + skeleton + current chapter narrative onto each frame.

Applies render-time stabilization (artifact JSON untouched):
- Short-gap fill: linear-interpolate bbox and hold last keypoints across
  gaps of ≤ SMOOTH_GAP_FRAMES frames per track id, so brief detection
  misses don't flicker on screen.

Track ids are not drawn — just the bbox + skeleton + chapter narrative.

Useful for visual QA of a bake without paying the inference cost twice.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

from offline_bake._pose_skeleton import get_edges

BBOX_COLOR = (62, 93, 198)
KPT_COLOR = (248, 197, 73)
EDGE_COLOR = (68, 162, 201)
SMOOTH_GAP_FRAMES = 5

CJK_FONT_CANDIDATES = (
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/Hiragino Sans GB.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
)


def _load_cjk_font(size: int = 26) -> ImageFont.FreeTypeFont | None:
    for path in CJK_FONT_CANDIDATES:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return None


def _draw_text_cjk(frame: np.ndarray, text: str, xy: tuple[int, int], font) -> None:
    if font is None:
        cv2.putText(
            frame, text[:60], xy, cv2.FONT_HERSHEY_SIMPLEX, 0.7, (31, 26, 23), 2,
        )
        return
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    pil = Image.fromarray(rgb)
    draw = ImageDraw.Draw(pil)
    x, y = xy
    for dx in (-1, 1):
        for dy in (-1, 1):
            draw.text((x + dx, y + dy), text, font=font, fill=(255, 255, 255))
    draw.text((x, y), text, font=font, fill=(31, 26, 23))
    frame[:] = cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)


def _draw_bbox(frame: np.ndarray, xywh: list[int]) -> None:
    x, y, w, h = xywh
    cv2.rectangle(frame, (x, y), (x + w, y + h), BBOX_COLOR, 2)


def _build_track_timeline(
    tracks_payload: dict, poses_payload: dict, num_frames: int
) -> tuple[dict[int, dict[int, list[int]]], dict[int, dict[int, list[list[float]]]]]:
    """Build per-track, per-frame (bbox, keypoints) lookups with ≤SMOOTH_GAP_FRAMES gap fill.

    Returns (bbox_by_track, pose_by_track) where each is
    {track_id: {frame_idx: payload}}. Gaps longer than SMOOTH_GAP_FRAMES are
    left unfilled (track considered truly gone).
    """
    bbox_raw: dict[int, dict[int, list[int]]] = {}
    pose_raw: dict[int, dict[int, list[list[float]]]] = {}
    for idx, fr in enumerate(tracks_payload.get("frames", [])):
        for tr in fr.get("tracks", []):
            bbox_raw.setdefault(int(tr["id"]), {})[idx] = list(tr["bbox"])
    for idx, fr in enumerate(poses_payload.get("frames", [])):
        for p in fr.get("poses", []):
            pose_raw.setdefault(int(p["id"]), {})[idx] = list(p["keypoints"])

    def _fill(series: dict[int, dict], interp: bool) -> dict[int, dict]:
        filled: dict[int, dict] = {}
        for tid, frames in series.items():
            if not frames:
                continue
            present = sorted(frames)
            out = dict(frames)
            for a, b in zip(present, present[1:]):
                gap = b - a
                if 1 < gap <= SMOOTH_GAP_FRAMES + 1:
                    va, vb = frames[a], frames[b]
                    for k in range(1, gap):
                        alpha = k / gap
                        if interp:
                            out[a + k] = [
                                int(round(va[i] * (1 - alpha) + vb[i] * alpha))
                                for i in range(len(va))
                            ]
                        else:
                            out[a + k] = va  # hold last keypoints
            filled[tid] = out
        return filled

    return _fill(bbox_raw, interp=True), _fill(pose_raw, interp=False)


def _draw_skeleton(
    frame: np.ndarray,
    keypoints: list[list[float]],
    edges: list[tuple[int, int]],
    threshold: float,
) -> None:
    for a, b in edges:
        xa, ya, sa = keypoints[a]
        xb, yb, sb = keypoints[b]
        if sa >= threshold and sb >= threshold:
            cv2.line(
                frame, (int(xa), int(ya)), (int(xb), int(yb)),
                EDGE_COLOR, 2,
            )
    for x, y, s in keypoints:
        if s >= threshold:
            cv2.circle(frame, (int(x), int(y)), 3, KPT_COLOR, -1)


def _chapter_text_at(narratives: dict, t: float) -> str:
    for ch in narratives.get("chapters", []):
        if ch["start"] <= t < ch["end"]:
            return str(ch.get("text", ""))
    return ""


def render(bundle_dir: Path, output_video: Path, keypoint_threshold: float = 0.3) -> None:
    raw = bundle_dir / "raw.mp4"
    tracks = json.loads((bundle_dir / "tracks.json").read_text())
    poses = json.loads((bundle_dir / "poses.json").read_text())
    narratives = json.loads((bundle_dir / "narratives.json").read_text())

    num_frames = max(len(tracks.get("frames", [])), len(poses.get("frames", [])))
    bbox_by_track, pose_by_track = _build_track_timeline(tracks, poses, num_frames)
    edges = get_edges()

    cap = cv2.VideoCapture(str(raw))
    fps = cap.get(cv2.CAP_PROP_FPS) or 25
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")  # type: ignore[attr-defined]
    writer = cv2.VideoWriter(str(output_video), fourcc, fps, (w, h))
    font = _load_cjk_font(26)

    idx = 0
    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            t = idx / fps
            for frames in bbox_by_track.values():
                if idx in frames:
                    _draw_bbox(frame, frames[idx])
            for tid, frames in pose_by_track.items():
                if idx in frames:
                    _draw_skeleton(frame, frames[idx], edges, keypoint_threshold)
            text = _chapter_text_at(narratives, t)
            if text:
                _draw_text_cjk(frame, text[:60], (10, h - 40), font)
            writer.write(frame)
            idx += 1
    finally:
        cap.release()
        writer.release()
    print(f"rendered {idx} frames → {output_video}")


def _main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("bundle_dir", type=Path)
    ap.add_argument("output_video", type=Path)
    ap.add_argument("--threshold", type=float, default=0.3)
    args = ap.parse_args()
    render(args.bundle_dir, args.output_video, args.threshold)


if __name__ == "__main__":
    _main()
