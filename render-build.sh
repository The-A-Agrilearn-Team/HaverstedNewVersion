#!/bin/bash
set -e

echo "==> Installing pnpm..."
npm install -g pnpm

echo "==> Installing dependencies (scripts disabled to avoid ERR_PNPM_IGNORED_BUILDS)..."
pnpm install --no-frozen-lockfile --ignore-scripts

echo "==> Manually installing esbuild native binaries (all versions)..."
find node_modules/.pnpm -name "install.js" -path "*/esbuild@*/node_modules/esbuild/install.js" 2>/dev/null | while read f; do
  echo "  -> Installing: $f"
  node "$f" || true
done
node node_modules/esbuild/install.js 2>/dev/null || true

echo "==> Building API server..."
pnpm --filter @workspace/api-server run build

echo "==> Build complete!"
