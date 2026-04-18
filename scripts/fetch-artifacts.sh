#!/usr/bin/env bash
set -euo pipefail
VERSION="${1:-v0.2.0}"
shift || true

DEST="frontends/apps/dashboard/public/artifacts"
PATTERNS=("*.mp4" "*.jpg" "*.json")
TARBALL=0
# v0.4.0+ tarball releases require --tarball; landing/dashboard on v0.2.0/v0.3.0 remain flat.

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dest) DEST="$2"; shift 2 ;;
    --patterns-only-json) PATTERNS=("*.json"); shift ;;
    --tarball) TARBALL=1; shift ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

mkdir -p "$DEST"

if (( TARBALL == 1 )); then
  if ! gh release download "artifacts-$VERSION" --dir "$DEST" --pattern "*.tar.gz" --clobber 2>/tmp/fetch-artifacts.err; then
    echo "[fetch-artifacts] release artifacts-$VERSION not available; using committed fallbacks" >&2
    cat /tmp/fetch-artifacts.err >&2 || true
  else
    for archive in "$DEST"/*.tar.gz; do
      [[ -f "$archive" ]] || continue
      # Clear stale per-slug subdirectories before extracting (preserves DEST root)
      find "$DEST" -mindepth 1 -maxdepth 1 -type d -exec rm -rf {} +
      tar -xzf "$archive" -C "$DEST"
      rm "$archive"
    done
  fi
else
  mkdir -p "$DEST/overlays" "$DEST/posters"

  ARGS=(--dir "$DEST" --clobber)
  for p in "${PATTERNS[@]}"; do ARGS+=(--pattern "$p"); done

  if ! gh release download "artifacts-$VERSION" "${ARGS[@]}" 2>/tmp/fetch-artifacts.err; then
    echo "[fetch-artifacts] release artifacts-$VERSION not available; using committed fallbacks" >&2
    cat /tmp/fetch-artifacts.err >&2 || true
  fi

  find "$DEST" -maxdepth 1 -name "*.mp4" -exec mv -f {} "$DEST/overlays/" \; 2>/dev/null || true
  find "$DEST" -maxdepth 1 -name "*.jpg" -exec mv -f {} "$DEST/posters/" \; 2>/dev/null || true
fi
