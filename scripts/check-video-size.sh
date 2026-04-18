#!/usr/bin/env bash
# scripts/check-video-size.sh — fail if any tracked .mp4 exceeds 1MB unless allowlisted
set -euo pipefail
shopt -s globstar nullglob 2>/dev/null || true  # required for **/*.mp4 semantics in `case` patterns

THRESHOLD_BYTES=$((1 * 1024 * 1024))
# Prefix-based allowlist (robust without globstar-in-case):
ALLOW_PREFIXES=(
  "frontends/apps/playground/tests/fixtures/"
  "frontends/apps/landing/tests/fixtures/"
  "frontends/apps/dashboard/tests/fixtures/"
)

BAD=0
while IFS= read -r -d '' f; do
  size=$(wc -c < "$f" | tr -d ' ')
  if (( size > THRESHOLD_BYTES )); then
    allowed=0
    for p in "${ALLOW_PREFIXES[@]}"; do
      if [[ "$f" == "$p"* ]]; then allowed=1; break; fi
    done
    if (( allowed == 0 )); then
      echo "FAIL: $f is $size bytes (>1MB) and not in allowlist" >&2
      BAD=1
    fi
  fi
done < <(git ls-files -z '*.mp4')
exit $BAD
