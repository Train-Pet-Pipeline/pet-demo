#!/usr/bin/env bash
set -euo pipefail
VERSION="${1:-v0.2.0}"
DEST="frontends/apps/dashboard/public/artifacts"
mkdir -p "$DEST/overlays" "$DEST/posters"

gh release download "artifacts-$VERSION" \
    --dir "$DEST" \
    --pattern "*.mp4" --pattern "*.jpg" \
    --clobber

find "$DEST" -maxdepth 1 -name "*.mp4" -exec mv -f {} "$DEST/overlays/" \;
find "$DEST" -maxdepth 1 -name "*.jpg" -exec mv -f {} "$DEST/posters/" \;
