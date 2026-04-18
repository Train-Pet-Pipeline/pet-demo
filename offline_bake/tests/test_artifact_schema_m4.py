from offline_bake.artifact_schema import (
    TracksManifest, PosesManifest, ChapteredNarratives,
    M4ClipManifest, parse_tracks, parse_poses, parse_chaptered_narratives,
)


def test_tracks_manifest_roundtrip():
    payload = {
        "fps": 25,
        "frames": [
            {"t": 0.0, "tracks": [{"id": 1, "bbox": [10, 20, 100, 200], "score": 0.9}]},
            {"t": 0.04, "tracks": []},
        ],
    }
    m = parse_tracks(payload)
    assert m.fps == 25
    assert len(m.frames) == 2
    assert m.frames[0].tracks[0].bbox == [10, 20, 100, 200]


def test_poses_manifest_schema_required():
    payload = {"fps": 25, "schema": "ap10k-17", "frames": []}
    m = parse_poses(payload)
    assert m.schema == "ap10k-17"


def test_chaptered_narratives_multi():
    payload = {"chapters": [
        {"start": 0.0, "end": 8.0, "text": "A", "confidence": 0.9},
        {"start": 8.0, "end": 16.0, "text": "B", "confidence": 0.8},
    ]}
    m = parse_chaptered_narratives(payload)
    assert len(m.chapters) == 2
    assert m.chapters[1].end == 16.0


def test_chaptered_narratives_degraded_allows_empty_text():
    payload = {"chapters": [{"start": 0.0, "end": 8.0, "text": "", "confidence": 0.0}]}
    m = parse_chaptered_narratives(payload)
    assert m.chapters[0].text == ""
    assert m.chapters[0].confidence == 0.0
