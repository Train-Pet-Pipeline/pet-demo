from purrai_core.types import BBox, Track
from offline_bake.serializers import serialize_tracks

def _track(tid, x, y, w, h, score=0.9):
    return Track(track_id=tid, bbox=BBox(x, y, x + w, y + h),
                 score=score, class_id=0, class_name="cat")

def test_serialize_tracks_basic():
    frames = [
        (0.0, [_track(1, 10, 20, 100, 200)]),
        (0.04, [_track(1, 12, 22, 100, 200), _track(2, 300, 50, 80, 120, score=0.7)]),
    ]
    out = serialize_tracks(frames, fps=25)
    assert out["fps"] == 25
    assert len(out["frames"]) == 2
    assert out["frames"][0]["tracks"][0]["id"] == 1
    assert out["frames"][0]["tracks"][0]["bbox"] == [10, 20, 100, 200]
    assert out["frames"][0]["tracks"][0]["score"] == 0.9
    assert len(out["frames"][1]["tracks"]) == 2

def test_serialize_tracks_empty_frame():
    out = serialize_tracks([(0.0, [])], fps=25)
    assert out["frames"][0]["tracks"] == []

def test_serialize_tracks_sorted_by_time():
    frames = [
        (0.08, [_track(1, 0, 0, 10, 10)]),
        (0.0, [_track(1, 0, 0, 10, 10)]),
    ]
    out = serialize_tracks(frames, fps=25)
    assert [f["t"] for f in out["frames"]] == [0.0, 0.08]
