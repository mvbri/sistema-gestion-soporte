#!/usr/bin/env bash
# Release: actualizar código, migrar, rebuild frontend, reiniciar API.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/sistema-gestion-soporte}"
DOMAIN="${DOMAIN:-}"

cd "$APP_DIR"

echo "==> git pull"
git pull --ff-only

echo "==> Dependencias server"
cd server
npm install --omit=dev
bash "$APP_DIR/deploy/scripts/prepare-db.sh"

echo "==> Build client"
cd "$APP_DIR/client"
npm install
VITE_API_URL=/api npm run build

echo "==> Publicar estáticos"
sudo mkdir -p /var/www/sistema-soporte
sudo rsync -a --delete dist/ /var/www/sistema-soporte/

echo "==> Reiniciar API"
sudo systemctl restart sistema-soporte-api
sudo systemctl reload nginx

sleep 2
API_URL="${API_URL:-http://127.0.0.1:5000}"
if [[ -n "$DOMAIN" ]]; then
  API_URL="https://$DOMAIN"
fi
export API_URL
bash "$APP_DIR/deploy/scripts/verify-prod.sh"

echo "==> Release completado."
