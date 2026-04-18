#!/usr/bin/env bash
set -euo pipefail
VERSION="${1:-v0.2.0}"
shift || true

DEST="frontends/apps/dashboard/public/artifacts"
PATTERNS=("*.mp4" "*.jpg" "*.json")

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dest) DEST="$2"; shift 2 ;;
    --patterns-only-json) PATTERNS=("*.json"); shift ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

mkdir -p "$DEST/overlays" "$DEST/posters"

ARGS=(--dir "$DEST" --clobber)
for p in "${PATTERNS[@]}"; do ARGS+=(--pattern "$p"); done

if ! gh release download "artifacts-$VERSION" "${ARGS[@]}" 2>/tmp/fetch-artifacts.err; then
  echo "[fetch-artifacts] release artifacts-$VERSION not available; using committed fallbacks" >&2
  cat /tmp/fetch-artifacts.err >&2 || true
fi

find "$DEST" -maxdepth 1 -name "*.mp4" -exec mv -f {} "$DEST/overlays/" \; 2>/dev/null || true
find "$DEST" -maxdepth 1 -name "*.jpg" -exec mv -f {} "$DEST/posters/" \; 2>/dev/null || true
