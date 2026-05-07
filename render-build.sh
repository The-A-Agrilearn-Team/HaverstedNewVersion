#!/bin/bash
set -e

echo "==> Installing pnpm..."
npm install -g pnpm

echo "==> Installing dependencies (scripts disabled to avoid ERR_PNPM_IGNORED_BUILDS)..."
pnpm install --no-frozen-lockfile --ignore-scripts

echo "==> Manually installing esbuild native binary..."
ESBUILD_INSTALL=$(find node_modules/.pnpm -name "install.js" -path "*/esbuild*/install.js" 2>/dev/null | head -1)
if [ -n "$ESBUILD_INSTALL" ]; then
  echo "Found esbuild installer at: $ESBUILD_INSTALL"
  node "$ESBUILD_INSTALL" || true
else
  echo "esbuild installer not found via .pnpm, trying direct path..."
  node node_modules/esbuild/install.js 2>/dev/null || true
fi

echo "==> Building API server..."
pnpm --filter @workspace/api-server run build

echo "==> Build complete!"