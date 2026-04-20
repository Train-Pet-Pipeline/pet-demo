import json
import subprocess
from pathlib import Path

import pytest

from offline_bake.bake_m4 import bake_m4_from_yaml


@pytest.fixture
def tmp_video(tmp_path):
    out = tmp_path / "fake.mp4"
    subprocess.run(
        ["ffmpeg", "-f", "lavfi", "-i", "color=c=black:s=320x240:d=2",
         "-c:v", "libx264", "-r", "25", "-pix_fmt", "yuv420p", "-y", str(out)],
        check=True, capture_output=True,
    )
    return out


def test_bake_m4_produces_full_bundle(tmp_path, tmp_video):
    yaml_path = tmp_path / "clips.yaml"
    yaml_path.write_text(f"""
version: "0.4.0"
clips:
  - slug: fixture-a
    source_mp4: {tmp_video}
    source: ai_generated
    title: "Fixture A"
    tags: [test]
    chapters:
      - {{ start: 0.0, end: 1.0 }}
      - {{ start: 1.0, end: 2.0 }}
""", encoding="utf-8")
    out_dir = tmp_path / "artifacts"
    bake_m4_from_yaml(yaml_path, out_dir=out_dir, use_fake_pipeline=True)

    bundle = out_dir / "fixture-a"
    assert (bundle / "raw.mp4").exists()
    assert (bundle / "thumb.avif").exists()
    tracks = json.loads((bundle / "tracks.json").read_text())
    poses = json.loads((bundle / "poses.json").read_text())
    narr = json.loads((bundle / "narratives.json").read_text())
    assert tracks["fps"] == 25
    assert poses["schema"] == "ap10k-17"
    assert len(narr["chapters"]) == 2
    manifest = json.loads((out_dir / "manifest.json").read_text())
    assert manifest["clips"][0]["slug"] == "fixture-a"
    assert manifest["clips"][0]["chapter_count"] == 2

    # M5: reids.json and tracks.stitched.json produced alongside other artifacts
    reids_path = bundle / "reids.json"
    stitched_path = bundle / "tracks.stitched.json"
    assert reids_path.exists(), "bake_m4 must emit reids.json"
    assert stitched_path.exists(), "bake_m4 must emit tracks.stitched.json"

    import json as _json
    reids = _json.loads(reids_path.read_text())
    assert reids["fps"] == 25
    assert isinstance(reids["frames"], list)

    stitched = _json.loads(stitched_path.read_text())
    original = _json.loads((bundle / "tracks.json").read_text())
    assert stitched["fps"] == original["fps"]
    # Schema identical (may or may not rewrite ids for the Fake pipeline's single track)
    assert {"fps", "frames"} == set(stitched.keys())


def test_bake_m4_missing_chapters_single_full_chapter(tmp_path, tmp_video):
    yaml_path = tmp_path / "clips.yaml"
    yaml_path.write_text(f"""
version: "0.4.0"
clips:
  - slug: fixture-real
    source_mp4: {tmp_video}
    source: real_footage
    title: "Fixture real"
    tags: [unscripted]
""", encoding="utf-8")
    out_dir = tmp_path / "artifacts"
    bake_m4_from_yaml(yaml_path, out_dir=out_dir, use_fake_pipeline=True)
    narr = json.loads((out_dir / "fixture-real" / "narratives.json").read_text())
    assert len(narr["chapters"]) == 1
    assert narr["chapters"][0]["end"] == pytest.approx(2.0, abs=0.5)
