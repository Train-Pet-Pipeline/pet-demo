from __future__ import annotations

import json
from pathlib import Path

from offline_bake.apply_stitch import main


def _write_fixture(bundle: Path) -> None:
    """Write tracks.json + reids.json with clear death->birth pair to a bundle dir."""
    bundle.mkdir(parents=True, exist_ok=True)
    # Track 1 frames 0-2, track 2 frames 5-7 (gap 2). Both cats, same embedding.
    tracks = {
        "fps": 25,
        "frames": [
            {"t": 0.0, "tracks": [{"id": 1, "bbox": [0, 0, 10, 10], "score": 0.9}]},
            {"t": 0.04, "tracks": [{"id": 1, "bbox": [0, 0, 10, 10], "score": 0.9}]},
            {"t": 0.08, "tracks": [{"id": 1, "bbox": [0, 0, 10, 10], "score": 0.9}]},
            {"t": 0.20, "tracks": [{"id": 2, "bbox": [0, 0, 10, 10], "score": 0.9}]},
            {"t": 0.24, "tracks": [{"id": 2, "bbox": [0, 0, 10, 10], "score": 0.9}]},
            {"t": 0.28, "tracks": [{"id": 2, "bbox": [0, 0, 10, 10], "score": 0.9}]},
        ],
    }
    reids = {
        "fps": 25,
        "frames": [
            {"frame_idx": 0, "embeddings": {"1": [1.0, 0.0, 0.0]}},
            {"frame_idx": 1, "embeddings": {"1": [1.0, 0.0, 0.0]}},
            {"frame_idx": 2, "embeddings": {"1": [1.0, 0.0, 0.0]}},
            {"frame_idx": 5, "embeddings": {"2": [1.0, 0.0, 0.0]}},
            {"frame_idx": 6, "embeddings": {"2": [1.0, 0.0, 0.0]}},
            {"frame_idx": 7, "embeddings": {"2": [1.0, 0.0, 0.0]}},
        ],
    }
    (bundle / "tracks.json").write_text(json.dumps(tracks))
    (bundle / "reids.json").write_text(json.dumps(reids))


def test_apply_stitch_writes_stitched_tracks(tmp_path: Path) -> None:
    """CLI main() stitches tracks and writes tracks.stitched.json."""
    bundle = tmp_path / "fake-slug"
    _write_fixture(bundle)

    rc = main(["--bundle", str(bundle)])
    assert rc == 0

    out = json.loads((bundle / "tracks.stitched.json").read_text())
    # All track ids should collapse to 1 after stitch
    all_ids = {t["id"] for fr in out["frames"] for t in fr["tracks"]}
    assert all_ids == {1}
    # Original tracks.json untouched
    original = json.loads((bundle / "tracks.json").read_text())
    assert {t["id"] for fr in original["frames"] for t in fr["tracks"]} == {1, 2}


def test_apply_stitch_missing_reids_is_noop(tmp_path: Path) -> None:
    """CLI returns non-zero exit and writes no output when reids.json absent."""
    bundle = tmp_path / "fake-slug"
    bundle.mkdir()
    tracks = {
        "fps": 25,
        "frames": [
            {"t": 0.0, "tracks": [{"id": 1, "bbox": [0, 0, 10, 10], "score": 0.9}]},
        ],
    }
    (bundle / "tracks.json").write_text(json.dumps(tracks))
    # No reids.json

    rc = main(["--bundle", str(bundle)])
    assert rc != 0  # CLI reports error
    assert not (bundle / "tracks.stitched.json").exists()
