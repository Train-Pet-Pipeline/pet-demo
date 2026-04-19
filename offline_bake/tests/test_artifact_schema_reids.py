from offline_bake.artifact_schema import ReidFrame, parse_reids, ReidsManifest


def test_reid_frame_typeddict_round_trip():
    payload = {
        "fps": 25,
        "frames": [
            {"frame_idx": 0, "embeddings": {"1": [0.1, 0.2, 0.3]}},
            {"frame_idx": 1, "embeddings": {}},
        ],
    }
    m = parse_reids(payload)
    assert m.fps == 25
    assert len(m.frames) == 2
    assert m.frames[0].frame_idx == 0
    assert m.frames[0].embeddings == {1: [0.1, 0.2, 0.3]}
    assert m.frames[1].embeddings == {}


def test_parse_reids_rejects_malformed():
    import pytest
    with pytest.raises(Exception):
        parse_reids({"fps": 25})  # missing "frames"
