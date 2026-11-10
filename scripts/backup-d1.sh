#!/usr/bin/env bash
set -euo pipefail

# Backup lógico do D1 para o R2. Requer CLOUDFLARE_API_TOKEN e CLOUDFLARE_ACCOUNT_ID.
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FILE="/tmp/mimelie-d1-${STAMP}.sql"

wrangler d1 export mimelie-db --remote --output "$FILE"
wrangler r2 object put "mimelie-media/backups/d1/mimelie-${STAMP}.sql" --file "$FILE"
rm -f "$FILE"

echo "Backup enviado para r2://mimelie-media/backups/d1/mimelie-${STAMP}.sql"
