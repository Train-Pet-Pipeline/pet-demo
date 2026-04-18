from unittest.mock import MagicMock
from offline_bake.chapter_narratives import build_chaptered_narratives


def test_multi_chapter_calls_vlm_per_chapter():
    vlm = MagicMock(side_effect=[("text A", 0.9), ("text B", 0.8)])
    out = build_chaptered_narratives(
        video_path="any.mp4",
        chapters=[(0.0, 8.0), (8.0, 16.0)],
        vlm_call=vlm,
    )
    assert len(out["chapters"]) == 2
    assert out["chapters"][0]["text"] == "text A"
    assert out["chapters"][1]["confidence"] == 0.8
    assert vlm.call_count == 2


def test_missing_chapters_defaults_to_single_full_clip():
    vlm = MagicMock(return_value=("full", 0.7))
    out = build_chaptered_narratives(
        video_path="any.mp4", chapters=None, full_duration_s=24.0, vlm_call=vlm,
    )
    assert out["chapters"] == [{"start": 0.0, "end": 24.0, "text": "full", "confidence": 0.7}]
    vlm.assert_called_once()


def test_vlm_failure_degrades_to_empty_text_zero_confidence():
    def vlm(path, start, end):
        raise RuntimeError("VLM down")
    out = build_chaptered_narratives(
        video_path="any.mp4", chapters=[(0.0, 8.0)], vlm_call=vlm,
    )
    assert out["chapters"][0]["text"] == ""
    assert out["chapters"][0]["confidence"] == 0.0
