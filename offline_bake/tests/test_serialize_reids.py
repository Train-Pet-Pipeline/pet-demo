from purrai_core.types import ReidEmbedding
from offline_bake.serializers import serialize_reids


def test_serialize_reids_empty_frames():
    result = serialize_reids([], fps=25)
    assert result == {"fps": 25, "frames": []}


def test_serialize_reids_single_frame_two_tracks():
    frames = [(0, [
        ReidEmbedding(track_id=1, vector=(0.1, 0.2, 0.3)),
        ReidEmbedding(track_id=2, vector=(0.9, 0.8, 0.7)),
    ])]
    result = serialize_reids(frames, fps=25)
    assert result["fps"] == 25
    assert len(result["frames"]) == 1
    f0 = result["frames"][0]
    assert f0["frame_idx"] == 0
    assert f0["embeddings"] == {
        "1": [0.1, 0.2, 0.3],
        "2": [0.9, 0.8, 0.7],
    }


def test_serialize_reids_no_embeddings_emits_empty_dict():
    frames = [(5, [])]
    result = serialize_reids(frames, fps=25)
    assert result["frames"][0] == {"frame_idx": 5, "embeddings": {}}


def test_serialize_reids_rounds_to_6_decimals():
    frames = [(0, [ReidEmbedding(track_id=1, vector=(0.123456789, -0.5))])]
    result = serialize_reids(frames, fps=25)
    assert result["frames"][0]["embeddings"]["1"] == [0.123457, -0.5]
