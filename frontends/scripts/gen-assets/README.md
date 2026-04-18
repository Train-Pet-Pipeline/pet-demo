# gen-assets

Unified visual-asset pipeline for `pet-demo` frontends. Doubao-Seedance primary, Unsplash fallback.

## Usage

```bash
cp .env.example .env.local   # fill keys from 1Password / vault — DO NOT COMMIT
pnpm -F @purrai/gen-assets gen        # regenerate everything in manifest.yaml
pnpm -F @purrai/gen-assets gen hero   # regenerate one entry
```

Generated images write to each app's `public/images/`. Commit them.

## Provider selection

`manifest.yaml` per-entry `provider: doubao | unsplash`. Doubao falls back to Unsplash on error.
Set `DOUBAO_RUNTIME=python` to call `src/providers/doubao_runner.py` via subprocess (uses `pet-pipeline` conda env).

## Keys

`.env.local` is gitignored. CI secrets injected via env (not used for runtime).
