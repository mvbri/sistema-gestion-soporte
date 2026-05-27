#!/usr/bin/env bash
# Aplica migraciones pendientes y verifica esquema (usar antes de arrancar en producción).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
SERVER_DIR="$APP_DIR/server"

if [[ ! -f "$SERVER_DIR/.env" ]]; then
  echo "ERROR: Falta $SERVER_DIR/.env (copia desde .env.production.example)" >&2
  exit 1
fi

cd "$SERVER_DIR"
echo "==> Preparando BD en $(grep -E '^DB_NAME=' .env | cut -d= -f2)@$(grep -E '^DB_HOST=' .env | cut -d= -f2)"
npm run migrate
npm run schema:check
echo "==> Base de datos lista."
