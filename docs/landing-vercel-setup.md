# Landing Vercel Project Setup

The landing app uses a **separate Vercel project** from the dashboard. **Do not** add a second `vercel.json` at the repo root — the existing one configures the dashboard.

## One-time setup

1. Vercel UI → New Project → import `pet-demo`
2. Project Name: `purrai-landing` (or as preferred)
3. Framework Preset: **Next.js**
4. **Root Directory: `frontends/apps/landing`** (this is the critical setting)
5. Install Command (Override): `cd ../../.. && pnpm install --frozen-lockfile`
6. Build Command (Override): `cd ../../.. && bash scripts/fetch-artifacts.sh v0.2.0 --dest frontends/apps/landing/public/artifacts || true && pnpm -F landing build`
7. Output Directory: `.next` (default)
8. Production Branch: `main`
9. Preview Branches: `dev` (and any `feature/*`)
10. Environment Variables: none required for runtime (gen-assets keys are local/CI only).

## Install command fallback

If Vercel's auto-detected pnpm install fails (because the lockfile sits at repo root, not at Root Directory), use the override above. If even the override fails (e.g., Vercel can't find pnpm before running it), set Root Directory to `.` (repo root) and Build Command to `bash scripts/fetch-artifacts.sh v0.2.0 --dest frontends/apps/landing/public/artifacts && cd frontends && pnpm install --frozen-lockfile && pnpm -F landing build`, with Output Directory `frontends/apps/landing/.next`. This sacrifices Vercel's per-app dashboard cleanliness for a guaranteed-working install.

## Deployment expectations

- `dev` push → Vercel preview deploy
- `main` push → Vercel production deploy
- `fetch-artifacts.sh` falls back to committed placeholder `benchmarks.json` until the `artifacts-v0.2.0` GH Release exists with JSON files
- After the GH Release backfill (GPU rental phase), no landing code change is needed; the next deploy picks up real data automatically
