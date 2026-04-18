# Playground Vercel Project Setup

The playground app uses a **separate Vercel project** from the dashboard and landing. **Do not** add a second `vercel.json` at the repo root — the existing one configures the dashboard.

## Prerequisites

- Vercel account with access to the `pet-demo` GitHub repo
- GitHub Release `artifacts-v0.4.0` published (created during M4.5 operator phase)

## Create project

1. Vercel UI → New Project → import `pet-demo`
2. Project Name: `purrai-playground`
3. Framework Preset: **Next.js**
4. **Root Directory: `frontends/apps/playground`** (this is the critical setting)

## Configure Build

5. Install Command (Override): `cd ../../.. && pnpm install --frozen-lockfile`
6. Build Command (Override): `cd ../../.. && bash scripts/fetch-artifacts.sh v0.4.0 --dest frontends/apps/playground/public/artifacts --tarball || true && pnpm -F playground build`
7. Output Directory: `.next` (default)

## Configure Branches

8. Production Branch: `main`
9. Preview Branches: `dev` and any `feature/*`

## Verify

After the first deploy succeeds:

- Preview URL → gallery page 1 loads (AI clip grid, CanvasOverlay skeletons visible)
- Preview URL → real-sample page 2 loads (real footage clip renders)
- Console: no 404s for `/artifacts/` paths

## Post-deploy notes

- `fetch-artifacts.sh --tarball` downloads per-slug `.tar.gz` bundles from `artifacts-v0.4.0`. Each bundle extracts to `public/artifacts/<slug>/` with `raw.mp4`, `overlay.mp4`, `poster.jpg`, `meta.json`.
- If the GH Release does not yet exist, the script falls back gracefully (`|| true`) and the build completes with placeholder assets.
- After the GH Release backfill (M4.5 operator phase), no Vercel config change is needed; the next deploy picks up real bundles automatically.
- v0.4.0+ tarball releases require `--tarball`; landing/dashboard on v0.2.0/v0.3.0 remain flat and do NOT pass `--tarball`.
