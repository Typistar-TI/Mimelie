#!/usr/bin/env sh
set -eu
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_BUCKET:?BACKUP_BUCKET is required}"
backup_file="$(mktemp)/mimelie-$(date -u +%Y%m%dT%H%M%SZ).dump"
trap 'rm -f "$backup_file"' EXIT
pg_dump --format=custom --no-owner --file="$backup_file" "$DATABASE_URL"
rclone copyto "$backup_file" "$BACKUP_BUCKET/$(basename "$backup_file")" --s3-server-side-encryption AES256
echo "Encrypted-at-rest backup uploaded: $(basename "$backup_file")"
