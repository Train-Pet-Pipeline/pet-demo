# pet-demo Release Checklist

Operator follow-ups that cannot be fixed in code. Complete before promoting to production.

## Vercel / Hosting

- [ ] **NEXT_PUBLIC_SITE_URL** — Set in Vercel project settings for `purrai-landing` to the canonical domain (e.g. `https://purrai.ai`). The repo default in `.env.production` is a placeholder; Vercel env vars override it at build time.
- [ ] Create **`purrai-landing`** Vercel project (Root Dir: `frontends/apps/landing`). See `docs/landing-vercel-setup.md`.
- [ ] Create **`purrai-playground`** Vercel project (Root Dir: `frontends/apps/playground`). See `docs/playground-vercel-setup.md`.

## Asset Baking

- [ ] **C-5: Re-bake dashboard overlays** — `public/artifacts/overlays/clip_*.mp4` are currently SMPTE test patterns. Run `offline_bake/generate_overlays.py` with real pet-data video input and replace committed files.
- [ ] **M-5: Re-bake landing benchmarks** — `frontends/apps/landing/public/artifacts/benchmarks.json` contains `"更新中"` placeholder values. Run `offline_bake/run_benchmarks.py` on a real eval run and commit updated JSON.

## GitHub Release

- [ ] **Re-bake `artifacts-v1.0.0` GH Release** — package includes stitched tracks from Production Phase 1 (P1). Upload tarball `artifacts-v1.0.0.tar.gz` with real clips after C-5 and M-5 above are complete.
