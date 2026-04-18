# pet-demo

PETKIT-grade showcase repo for Train-Pet-Pipeline. Demonstrates the AI health-warning pipeline (detect → track → re-id → pose → VLM narrative) with power/privacy-conscious on-device framing.

## Required reading

- Parent monorepo guide: `../pet-infra/docs/DEVELOPMENT_GUIDE.md`
- Design spec: `../docs/superpowers/specs/2026-04-17-pet-demo-design.md`
- M1 plan: `../docs/superpowers/plans/2026-04-17-pet-demo-m1-core.md`
- M4 Playground design spec: `../docs/superpowers/specs/2026-04-18-pet-demo-m4-playground-design.md`

## Directory layout

- `core/` — installable Python package `purrai-core` with 5 Protocol interfaces, 5 real backends, FullPipeline, utils
- `offline_bake/` — three CLI scripts (overlays / benchmarks / narratives) for generating landing/dashboard assets
- `offline_bake/_fakes.py` — **only** allowed Fake-backend site, used by `--use-fake-pipeline` CLI flag and offline_bake tests
- `frontends/` — pnpm workspace (M2+): `apps/dashboard/` + `apps/landing/` + `apps/playground/` (all Next.js 14) + `packages/ui` + `packages/theme`. Use `pnpm -F <app> <task>` from `frontends/` root
- `frontends/scripts/gen-assets/` — visual asset pipeline (Doubao-Seedance + Unsplash fallback); manifest-driven, output committed
- `frontends/apps/landing/` — public landing page (Next.js 14 + next-intl, 8 sections, Vercel project separate from dashboard)
- `frontends/apps/playground/` — M4 clip-viewer playground (Next.js 14, CanvasOverlay skeleton overlay, per-slug artifact bundles, Vercel project `purrai-playground`)
- `scripts/` — operator shell (`bake-artifacts.sh`, `fetch-artifacts.sh`, `build-offline-bundle.sh`); all take `$VERSION` (default `v0.2.0`) as first arg

## ESLint plugin note

`eslint-plugin-landing` was renamed to `eslint-plugin-frontends` in M4 (PR2). The package now covers all three frontend apps. Reference it as `eslint-plugin-frontends` in any new ESLint config.

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
