"""Pure JSON serializers for M4 artifact production.

Converts purrai_core outputs (list[Track], list[PoseResult]) into dict payloads
whose shape matches offline_bake.artifact_schema.TracksManifest / PosesManifest.
"""
from __future__ import annotations

from typing import Iterable

from purrai_core.types import Track


def _bbox_xywh(t: Track) -> list[int]:
    x = int(round(t.bbox.x1))
    y = int(round(t.bbox.y1))
    w = int(round(t.bbox.x2 - t.bbox.x1))
    h = int(round(t.bbox.y2 - t.bbox.y1))
    return [x, y, w, h]


def serialize_tracks(
    frames: Iterable[tuple[float, list[Track]]], *, fps: int
) -> dict:
    """Serialize per-frame tracker output into TracksManifest JSON shape.

    Args:
        frames: Iterable of (timestamp_seconds, list[Track]).
        fps: Canonical frames-per-second for the source video.

    Returns:
        dict with keys {"fps", "frames"}. Frames are sorted by ascending time;
        bboxes use xywh integer pixels; scores rounded to 4 decimals.
    """
    sorted_frames = sorted(frames, key=lambda fr: fr[0])
    return {
        "fps": fps,
        "frames": [
            {
                "t": round(t, 4),
                "tracks": [
                    {"id": tr.track_id, "bbox": _bbox_xywh(tr),
                     "score": round(float(tr.score), 4)}
                    for tr in tracks
                ],
            }
            for t, tracks in sorted_frames
        ],
    }
