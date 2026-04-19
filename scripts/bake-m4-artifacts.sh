#!/usr/bin/env bash
# Bake M4 Playground per-slug bundles from offline_bake/m4_curated_clips.yaml
# and publish them as a single tarball on a GitHub release.
#
# Usage:
#   scripts/bake-m4-artifacts.sh [VERSION] [--params PATH] [--skip-release]
#
# VERSION defaults to v0.4.0. --params defaults to core/params.yaml (override
# for CPU-only or MPS hosts). --skip-release produces the tarball locally
# without creating a GH release (useful for dry runs).
set -euo pipefail

VERSION="${1:-v0.4.0}"
shift || true

PARAMS="core/params.yaml"
SKIP_RELEASE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --params) PARAMS="$2"; shift 2 ;;
    --skip-release) SKIP_RELEASE=1; shift ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

OUT="artifacts-out"
CLIPS_YAML="offline_bake/m4_curated_clips.yaml"
TARBALL="dist/pet-demo-artifacts-$VERSION.tar.gz"

rm -rf "$OUT" && mkdir -p "$OUT" dist

conda run -n pet-pipeline python -m offline_bake.bake_m4 \
  "$CLIPS_YAML" "$OUT" --params "$PARAMS"

tar -czf "$TARBALL" -C "$OUT" .
echo "tarball: $TARBALL"
ls -la "$TARBALL"

if (( SKIP_RELEASE == 1 )); then
  echo "--skip-release set; not creating GH release."
  exit 0
fi

gh release create "artifacts-$VERSION" \
  --title "pet-demo artifacts $VERSION" \
  --notes "M4 Playground bundles baked from $CLIPS_YAML with $PARAMS" \
  "$TARBALL"
