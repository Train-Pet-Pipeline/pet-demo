"""Pure JSON serializers for M4 artifact production.

Converts purrai_core outputs (list[Track], list[PoseResult]) into dict payloads
whose shape matches offline_bake.artifact_schema.TracksManifest / PosesManifest.
"""
from __future__ import annotations

from typing import Iterable

from purrai_core.backends.pose_schema import AP10K_KPT_NAMES
from purrai_core.types import PoseResult, Track


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


def _kpt_row(kp) -> list[float]:
    return [round(float(kp.x), 3), round(float(kp.y), 3), round(float(kp.score), 4)]


def serialize_poses(
    frames: Iterable[tuple[float, list[PoseResult]]], *, fps: int
) -> dict:
    """Serialize per-frame pose output into PosesManifest JSON shape.

    Keypoints are emitted in canonical AP-10K 17-keypoint order. Missing
    keypoints (not present in PoseResult.keypoints) are padded as
    [0.0, 0.0, 0.0] (zero-confidence).

    Args:
        frames: Iterable of (timestamp_seconds, list[PoseResult]).
        fps: Canonical frames-per-second for the source video.

    Returns:
        dict with keys {"fps", "schema", "frames"} — schema pinned to "ap10k-17".
    """
    sorted_frames = sorted(frames, key=lambda fr: fr[0])
    name_index = {n: i for i, n in enumerate(AP10K_KPT_NAMES)}
    out_frames = []
    for t, poses in sorted_frames:
        pose_entries = []
        for p in poses:
            kpts: list[list[float]] = [[0.0, 0.0, 0.0] for _ in range(17)]
            for kp in p.keypoints:
                if kp.name in name_index:
                    kpts[name_index[kp.name]] = _kpt_row(kp)
            pose_entries.append({"id": p.track_id, "keypoints": kpts})
        out_frames.append({"t": round(t, 4), "poses": pose_entries})
    return {"fps": fps, "schema": "ap10k-17", "frames": out_frames}
