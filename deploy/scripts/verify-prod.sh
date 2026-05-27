#!/usr/bin/env bash
# Comprueba que la API responde y el esquema está listo.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
API_URL="${API_URL:-http://127.0.0.1:5000}"

export APP_DIR API_URL
exec node "$SCRIPT_DIR/verify-prod.mjs"
