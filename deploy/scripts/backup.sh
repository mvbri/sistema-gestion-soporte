#!/usr/bin/env bash
# Backup diario: dump MariaDB + tarball de uploads. Retención 14 días.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/sistema-gestion-soporte}"
SERVER_DIR="$APP_DIR/server"
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/sistema-soporte}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date +%Y-%m-%d_%H-%M-%S)"

if [[ ! -f "$SERVER_DIR/.env" ]]; then
  echo "ERROR: No existe $SERVER_DIR/.env" >&2
  exit 1
fi

# shellcheck disable=SC1091
source "$SERVER_DIR/.env"

mkdir -p "$BACKUP_ROOT/db" "$BACKUP_ROOT/uploads"

DB_FILE="$BACKUP_ROOT/db/backup_${STAMP}.sql.gz"
UPLOADS_FILE="$BACKUP_ROOT/uploads/uploads_${STAMP}.tar.gz"

mysqldump \
  -h "${DB_HOST:-127.0.0.1}" \
  -P "${DB_PORT:-3306}" \
  -u "${DB_USER}" \
  -p"${DB_PASSWORD}" \
  --single-transaction \
  --routines \
  --triggers \
  "${DB_NAME}" | gzip > "$DB_FILE"

if [[ -d "$SERVER_DIR/uploads" ]]; then
  tar -czf "$UPLOADS_FILE" -C "$SERVER_DIR" uploads
fi

find "$BACKUP_ROOT/db" -name 'backup_*.sql.gz' -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_ROOT/uploads" -name 'uploads_*.tar.gz' -mtime +"$RETENTION_DAYS" -delete

echo "[$(date -Iseconds)] Backup OK: $DB_FILE"
[[ -f "$UPLOADS_FILE" ]] && echo "[$(date -Iseconds)] Uploads OK: $UPLOADS_FILE"
