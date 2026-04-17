# purrai-core

Installable Python package providing:

- Five Protocol interfaces (`purrai_core.interfaces.*`)
- Five real backends (`purrai_core.backends.*`)
- `FullPipeline` composing them (`purrai_core.pipelines.full_pipeline`)
- Utils for video I/O, structured logging, retry (`purrai_core.utils.*`)

## Install

```bash
pip install -e ".[dev]"                              # minimal, for lint/tests only
pip install -e ".[dev,detector,tracker]"             # + YOLOv10 + ByteTrack
pip install -e ".[dev,detector,tracker,reid]"        # + OSNet
pip install -e ".[dev,detector,tracker,reid,narrative]"  # + Qwen2-VL
pip install -e ".[dev,detector,tracker,reid,pose,narrative]"  # everything
```

Pose (mmpose) requires a CUDA-capable build environment — fine on Linux GPU hosts, iffy on macOS. Tests skip automatically when mmpose is absent.

## Run tests

```bash
pytest tests/ -v
```

## Lint + types

```bash
ruff check src/ tests/
ruff format --check src/ tests/
mypy src/purrai_core
```

## Usage

```python
from purrai_core.config import load_config
from purrai_core.backends.yolov10_detector import YOLOv10Detector
from purrai_core.backends.bytetrack_tracker import ByteTrackTracker
from purrai_core.backends.osnet_reid import OSNetReid
from purrai_core.backends.mmpose_pose import MMPosePoseEstimator
from purrai_core.backends.qwen2vl_narrative import Qwen2VLNarrative
from purrai_core.pipelines.full_pipeline import FullPipeline

cfg = load_config("params.yaml")
pipeline = FullPipeline(
    detector=YOLOv10Detector(cfg.section("detector")),
    tracker=ByteTrackTracker(cfg.section("tracker")),
    reid=OSNetReid(cfg.section("reid")),
    pose=MMPosePoseEstimator(cfg.section("pose")),
    narrative=Qwen2VLNarrative(cfg.section("narrative")),
    vlm_trigger_interval_frames=int(cfg.section("pipeline")["vlm_trigger_interval_frames"]),
)

import cv2
cap = cv2.VideoCapture("video.mp4")
for idx in range(1000):
    ok, frame = cap.read()
    if not ok: break
    result = pipeline.process_frame(frame, idx)
    if result.narrative:
        print(f"[{idx}] {result.narrative.text}")
```

## Install from git tag

```bash
pip install "git+https://github.com/Train-Pet-Pipeline/pet-demo.git@v0.1.0#subdirectory=core"
```
