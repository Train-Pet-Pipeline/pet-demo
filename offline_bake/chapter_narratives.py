"""Per-chapter VLM orchestration for M4 artifact bake.

Given a video path and a list of chapter time ranges, calls a provided VLM
function once per chapter and emits a ChapteredNarratives-shaped payload.
Degrades gracefully: if the VLM call raises, the chapter gets empty text
and zero confidence rather than aborting the whole bake.
"""
from __future__ import annotations

import logging
from typing import Callable

log = logging.getLogger(__name__)

VLMCall = Callable[[str, float, float], tuple[str, float]]


def build_chaptered_narratives(
    *,
    video_path: str,
    chapters: list[tuple[float, float]] | None,
    vlm_call: VLMCall,
    full_duration_s: float | None = None,
) -> dict:
    """Run the VLM once per chapter and collect results into a dict payload.

    Args:
        video_path: Path to the source video (passed through to vlm_call).
        chapters: List of (start_s, end_s) ranges. If None, falls back to a
            single full-clip chapter covering (0.0, full_duration_s).
        vlm_call: Callable taking (video_path, start_s, end_s) and returning
            (text, confidence). Raised exceptions are caught and degraded.
        full_duration_s: Required when chapters is None; ignored otherwise.

    Returns:
        dict shaped as {"chapters": [{"start", "end", "text", "confidence"}, ...]}
        matching offline_bake.artifact_schema.ChapteredNarratives.

    Raises:
        ValueError: If chapters is None and full_duration_s is also None.
    """
    if chapters is None:
        if full_duration_s is None:
            raise ValueError("either chapters or full_duration_s must be provided")
        chapters = [(0.0, float(full_duration_s))]

    out: list[dict] = []
    for start, end in chapters:
        try:
            text, conf = vlm_call(video_path, float(start), float(end))
        except Exception:
            log.exception("vlm failed for %s [%.2f, %.2f]; degrading", video_path, start, end)
            text, conf = "", 0.0
        out.append({
            "start": float(start),
            "end": float(end),
            "text": str(text),
            "confidence": float(conf),
        })
    return {"chapters": out}
