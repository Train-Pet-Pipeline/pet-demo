#!/usr/bin/env bash
set -euo pipefail
VERSION="${1:-v0.2.0}"
scripts/fetch-artifacts.sh "$VERSION"

cd frontends/apps/dashboard
MW_SRC="middleware.ts"
MW_BAK="middleware.ts.disabled-for-export"

mv "$MW_SRC" "$MW_BAK"
trap 'mv -f "$MW_BAK" "$MW_SRC" 2>/dev/null || true' EXIT

OFFLINE_BUNDLE=1 DASHBOARD_AUTH_DISABLED=true pnpm build
cd ../../..

DIST="dist/purrai-dashboard-offline-$VERSION"
rm -rf "$DIST"
mkdir -p "$DIST"
cp -r frontends/apps/dashboard/out/* "$DIST/"

cat > "$DIST/README.txt" <<'EOF'
Purr·AI Dashboard offline bundle
推荐运行方式:
    python3 -m http.server 8080
然后浏览器打开 http://localhost:8080
(直接 file:// 双击 index.html 某些 mp4 加载会受浏览器沙箱限制)
EOF

cd dist && zip -r "purrai-dashboard-offline-$VERSION.zip" "purrai-dashboard-offline-$VERSION"
