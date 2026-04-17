"""AP-10K skeleton edge provider for overlay rendering.

Primary source: mmpose.datasets.dataset_info.AP10K (when installed).
Fallback: embedded AP-10K standard 20-edge list.

AP-10K keypoint order (0-16):
  0 left_eye, 1 right_eye, 2 nose, 3 neck, 4 root_of_tail,
  5 left_shoulder, 6 left_elbow, 7 left_front_paw,
  8 right_shoulder, 9 right_elbow, 10 right_front_paw,
  11 left_hip, 12 left_knee, 13 left_back_paw,
  14 right_hip, 15 right_knee, 16 right_back_paw
"""

from __future__ import annotations

# Official AP-10K skeleton edges (pairs of keypoint indices).
# Source: mmpose/configs/_base_/datasets/ap10k.py (skeleton_info).
AP10K_FALLBACK_EDGES: tuple[tuple[int, int], ...] = (
    (0, 1),  # left_eye - right_eye
    (0, 2),  # left_eye - nose
    (1, 2),  # right_eye - nose
    (2, 3),  # nose - neck
    (3, 4),  # neck - root_of_tail
    (3, 5),  # neck - left_shoulder
    (5, 6),  # left_shoulder - left_elbow
    (6, 7),  # left_elbow - left_front_paw
    (3, 8),  # neck - right_shoulder
    (8, 9),  # right_shoulder - right_elbow
    (9, 10),  # right_elbow - right_front_paw
    (4, 11),  # root_of_tail - left_hip
    (11, 12),  # left_hip - left_knee
    (12, 13),  # left_knee - left_back_paw
    (4, 14),  # root_of_tail - right_hip
    (14, 15),  # right_hip - right_knee
    (15, 16),  # right_knee - right_back_paw
    (5, 8),  # left_shoulder - right_shoulder
    (11, 14),  # left_hip - right_hip
    (5, 11),  # left_shoulder - left_hip (torso side)
)


def _edges_from_mmpose() -> list[tuple[int, int]]:
    """Read skeleton edges from mmpose's AP-10K dataset_info.

    Raises:
        ImportError: mmpose not available.
        Exception: dataset_info shape differs from expected.
    """
    from mmpose.datasets.dataset_info import DatasetInfo
    from mmpose.datasets.datasets.utils import parse_pose_metainfo

    meta = parse_pose_metainfo(dict(from_file="configs/_base_/datasets/ap10k.py"))
    info = DatasetInfo(meta)
    return [tuple(edge) for edge in info.skeleton_links]


def get_edges() -> list[tuple[int, int]]:
    """Return AP-10K edges, preferring mmpose source and falling back to constant."""
    try:
        return _edges_from_mmpose()
    except Exception:  # noqa: BLE001
        return list(AP10K_FALLBACK_EDGES)
