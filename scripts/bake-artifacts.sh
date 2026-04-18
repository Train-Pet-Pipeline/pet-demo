#!/usr/bin/env bash
set -euo pipefail
VERSION="${1:-v0.2.0}"
OUT="offline_bake/assets_out"
CLIPS_YAML="offline_bake/curated_clips.yaml"

rm -rf "$OUT" && mkdir -p "$OUT/overlays" "$OUT/posters"

conda run -n pet-pipeline python -m offline_bake.bake_from_yaml \
    --clips "$CLIPS_YAML" \
    --output "$OUT" \
    --bench-frames 300

cp "$OUT/benchmarks.json" frontends/apps/dashboard/public/artifacts/
cp "$OUT/narratives.json" frontends/apps/dashboard/public/artifacts/

gh release create "artifacts-$VERSION" \
    --title "pet-demo artifacts $VERSION" \
    --notes "baked from curated_clips.yaml $VERSION" \
    "$OUT"/overlays/*.mp4 "$OUT"/posters/*.jpg
