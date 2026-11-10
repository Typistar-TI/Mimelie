#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

pnpm install --frozen-lockfile
pnpm --filter @mimelie/admin build
pnpm --filter @mimelie/web exec opennextjs-cloudflare build
rm -rf "$ROOT/apps/web/.open-next/assets/admin"
cp -r "$ROOT/apps/admin/dist" "$ROOT/apps/web/.open-next/assets/admin"

echo "Build da loja, painel e assets concluído."
