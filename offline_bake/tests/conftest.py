"""Shared fixtures for offline_bake tests."""

from __future__ import annotations

import shutil
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
CORE_FIXTURES = REPO_ROOT / "core" / "tests" / "fixtures"


@pytest.fixture
def sample_video() -> Path:
    """Return path to the shared sample.mp4 fixture."""
    return CORE_FIXTURES / "sample.mp4"


@pytest.fixture
def sample_clips_dir(tmp_path: Path) -> Path:
    """Return a directory containing 3 .mp4 clips.

    Prefers the real clips/ fixture directory; falls back to copying sample.mp4
    three times into a temporary directory for CI environments.
    """
    real = CORE_FIXTURES / "clips"
    if real.is_dir() and list(real.glob("*.mp4")):
        return real
    clips = tmp_path / "clips"
    clips.mkdir()
    src = CORE_FIXTURES / "sample.mp4"
    for i in range(3):
        shutil.copy(src, clips / f"clip_{i}.mp4")
    return clips
