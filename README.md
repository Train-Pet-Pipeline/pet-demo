# pet-demo

Showcase of the Train-Pet-Pipeline AI health-warning system. A reference implementation of end-to-end pet-behaviour understanding: detect → track → re-identify → estimate pose → generate narrative via Qwen2-VL.

## What's in M1

- `core/` — Python package `purrai-core` with:
  - Five Protocol interfaces: `Detector`, `Tracker`, `ReidEncoder`, `PoseEstimator`, `NarrativeGenerator`
  - Five real backends: YOLOv10 (ultralytics), ByteTrack (boxmot), OSNet (torchreid), MMPose AP-10K, Qwen2-VL-2B (transformers)
  - `FullPipeline` composing all five with event-triggered narrative
- `offline_bake/` — three CLI scripts that produce demo artefacts:
  - `generate_overlays.py` — renders bbox + keypoints + narrative overlay to mp4
  - `run_benchmarks.py` — measures mean_fps + per-stage latency to JSON
  - `sample_narratives.py` — VLM-describes a directory of clips to JSON

## Quickstart

```bash
# 1. Activate env
conda activate pet-pipeline  # or your python 3.11 env

# 2. Install core
pip install -e core/

# 3. Install offline_bake
pip install -e offline_bake/

# 4. Run tests
cd core && pytest tests/ -v
cd ../offline_bake && pytest tests/ -v

# 5. Smoke-test a bake script without real weights
cd ..
python offline_bake/run_benchmarks.py \
  --input core/tests/fixtures/sample.mp4 \
  --output /tmp/bench.json \
  --max-frames 20 \
  --use-fake-pipeline

cat /tmp/bench.json
```

## Real-weights runs (GPU recommended)

On a GPU box after `pip install 'core/[detector,tracker,reid,pose,narrative]'`:

```bash
python offline_bake/generate_overlays.py \
  --input path/to/video.mp4 \
  --output /tmp/overlays.mp4 \
  --max-frames 300
```

Weights (YOLOv10, OSNet, AP-10K pose, Qwen2-VL-2B) auto-download on first use (~5 GB combined).

## Relationship to sibling repos

pet-demo is a **consumer** of:
- `pet-train` — VLM produced by SFT/DPO training pipelines
- `pet-quantize` — for M2 on-device demo (deferred)

pet-demo does not modify `pet-schema` or any training-side contract.

## Status

- M1 (core + offline_bake): **complete**, tag `v0.1.0`
- M2-M5 (dashboard / landing / playground / polish): deferred

See `docs/superpowers/plans/2026-04-17-pet-demo-m1-core.md` in the parent monorepo.
