# pet-demo

PETKIT-grade showcase repo for Train-Pet-Pipeline. Demonstrates the AI health-warning pipeline (detect → track → re-id → pose → VLM narrative) with power/privacy-conscious on-device framing.

## Required reading

- Parent monorepo guide: `../pet-infra/docs/DEVELOPMENT_GUIDE.md`
- Design spec: `../docs/superpowers/specs/2026-04-17-pet-demo-design.md`
- M1 plan: `../docs/superpowers/plans/2026-04-17-pet-demo-m1-core.md`

## Directory layout

- `core/` — installable Python package `purrai-core` with 5 Protocol interfaces, 5 real backends, FullPipeline, utils
- `offline_bake/` — three CLI scripts (overlays / benchmarks / narratives) for generating landing/dashboard assets
- `offline_bake/_fakes.py` — **only** allowed Fake-backend site, used by `--use-fake-pipeline` CLI flag and offline_bake tests

## Git workflow

`feature/* → dev → main`, same as all sibling repos.
- PR target is always `dev`
- `dev → main` merged per milestone
- Squash-merge via `gh pr merge --squash --delete-branch --admin` after CI green

## Backend policy (hard rule)

All backends (`purrai_core.backends.*`) must import real libraries — no mock substitution. Tests may `patch()` at module scope. If a backend truly can't install (e.g., mmpose on macOS), use `pytest.importorskip(...)` and `@pytest.mark.skipif(...)` in tests; production code stays unconditional.

## Commit format

`feat|fix|refactor|test|docs(pet-demo): short description`

## Key constraints

- All numerics read from `core/params.yaml` — never hardcode
- Protocols are structural (typing.Protocol + @runtime_checkable); backends conform exactly
- offline_bake consumes purrai_core — never the reverse
