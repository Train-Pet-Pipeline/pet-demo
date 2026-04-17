"""Tests for offline_bake.generate_overlays (Task 18)."""

from __future__ import annotations

import tempfile
from pathlib import Path

from offline_bake.generate_overlays import render_overlays_from_pipeline_results


def test_render_overlays_produces_mp4(sample_video: Path) -> None:
    """Render 10 frames with fake pipeline and verify a non-empty mp4 is produced."""
    with tempfile.TemporaryDirectory() as td:
        out_path = Path(td) / "out.mp4"
        render_overlays_from_pipeline_results(
            input_video=sample_video,
            output_video=out_path,
            max_frames=10,
            use_fake_pipeline=True,
        )
        assert out_path.exists(), "output mp4 was not created"
        assert out_path.stat().st_size > 0, "output mp4 is empty"


def test_draw_pose_renders_skeleton_lines() -> None:
    """_draw_pose draws line pixels between high-confidence keypoint pairs."""
    import numpy as np
    from purrai_core.types import Keypoint, PoseResult

    from offline_bake._pose_skeleton import get_edges
    from offline_bake.generate_overlays import _draw_pose

    # AP-10K 17 keypoints, all at score 0.9, laid out at distinct coordinates.
    names = [f"kp{i}" for i in range(17)]
    kps = [Keypoint(n, float(20 + i * 8), float(20 + i * 5), 0.9) for i, n in enumerate(names)]
    pose = PoseResult(track_id=1, keypoints=kps)

    frame_points_only = np.zeros((256, 256, 3), dtype=np.uint8)
    frame_with_edges = np.zeros((256, 256, 3), dtype=np.uint8)

    _draw_pose(frame_points_only, pose, edges=[])  # no edges → points only
    _draw_pose(frame_with_edges, pose, edges=get_edges())

    pixels_points = int((frame_points_only > 0).any(axis=-1).sum())
    pixels_edges = int((frame_with_edges > 0).any(axis=-1).sum())
    assert pixels_edges > pixels_points, (
        f"expected edges to add pixels; points={pixels_points} edges={pixels_edges}"
    )


def test_draw_pose_skips_edges_below_threshold() -> None:
    """Edges whose either endpoint has score below threshold are NOT drawn."""
    import numpy as np
    from purrai_core.types import Keypoint, PoseResult

    from offline_bake.generate_overlays import _draw_pose

    # 17 keypoints but all with score=0.0 — below any reasonable threshold.
    kps = [Keypoint(f"kp{i}", float(20 + i * 8), float(20 + i * 5), 0.0) for i in range(17)]
    pose = PoseResult(track_id=1, keypoints=kps)

    frame = np.zeros((256, 256, 3), dtype=np.uint8)
    _draw_pose(frame, pose, edges=[(0, 1), (1, 2)], keypoint_threshold=0.3)
    assert int((frame > 0).any(axis=-1).sum()) == 0, "no edges should be drawn"
