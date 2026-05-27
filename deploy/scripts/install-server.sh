#!/usr/bin/env bash
# Instalación inicial en Ubuntu 22.04/24.04 (servidor alcaldía o VPS en Venezuela).
# Ejecutar como root o con sudo desde la raíz del repositorio clonado.
#
# Variables opcionales:
#   APP_DIR   — ruta de la app (default: /opt/sistema-gestion-soporte)
#   DOMAIN    — dominio o IP (default: localhost)
#   INTRANET  — 1 para omitir UFW y usar FRONTEND_URL http
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/sistema-gestion-soporte}"
DOMAIN="${DOMAIN:-localhost}"
INTRANET="${INTRANET:-0}"
DB_NAME="${DB_NAME:-sistema_soporte}"
DB_USER="${DB_USER:-soporte_app}"
WEB_ROOT="/var/www/sistema-soporte"
BACKUP_ROOT="/var/backups/sistema-soporte"

if [[ $EUID -ne 0 ]]; then
  echo "Ejecuta con sudo: sudo bash deploy/scripts/install-server.sh" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "==> Instalando paquetes del sistema"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq \
  curl git nginx mariadb-server certbot python3-certbot-nginx \
  rsync ufw

if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi

echo "==> MariaDB: base y usuario"
systemctl enable --now mariadb

if [[ ! -f "$REPO_ROOT/server/.env" ]]; then
  cp "$REPO_ROOT/server/.env.production.example" "$REPO_ROOT/server/.env"
  DB_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)"
  sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" "$REPO_ROOT/server/.env"
  sed -i "s/DB_USER=.*/DB_USER=$DB_USER/" "$REPO_ROOT/server/.env"
  sed -i "s/DB_NAME=.*/DB_NAME=$DB_NAME/" "$REPO_ROOT/server/.env"
  if [[ "$INTRANET" == "1" ]]; then
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://$DOMAIN|" "$REPO_ROOT/server/.env"
  else
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|" "$REPO_ROOT/server/.env"
  fi
  echo "Contraseña BD generada en server/.env (DB_PASSWORD). Guárdala."
else
  # shellcheck disable=SC1091
  source "$REPO_ROOT/server/.env"
  DB_PASSWORD="${DB_PASSWORD:?Define DB_PASSWORD en server/.env}"
fi

mysql -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';"
mysql -e "GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

if grep -q '^bind-address' /etc/mysql/mariadb.conf.d/50-server.cnf 2>/dev/null; then
  sed -i 's/^bind-address.*/bind-address = 127.0.0.1/' /etc/mysql/mariadb.conf.d/50-server.cnf
else
  echo 'bind-address = 127.0.0.1' >> /etc/mysql/mariadb.conf.d/50-server.cnf
fi
systemctl restart mariadb

echo "==> Enlazar aplicación en $APP_DIR"
if [[ "$REPO_ROOT" != "$APP_DIR" ]]; then
  mkdir -p "$(dirname "$APP_DIR")"
  ln -sfn "$REPO_ROOT" "$APP_DIR"
fi

mkdir -p "$WEB_ROOT" "$BACKUP_ROOT/db" "$BACKUP_ROOT/uploads"
mkdir -p "$APP_DIR/server/uploads/tickets" "$APP_DIR/server/backups"
chown -R www-data:www-data "$APP_DIR/server/uploads" "$APP_DIR/server/backups"

echo "==> Dependencias Node"
cd "$APP_DIR/server"
sudo -u www-data npm install --omit=dev
bash "$APP_DIR/deploy/scripts/prepare-db.sh"

echo "==> Build frontend"
cd "$APP_DIR/client"
npm install
VITE_API_URL=/api npm run build
rsync -a --delete dist/ "$WEB_ROOT/"

echo "==> Nginx"
sed "s/DOMAIN/$DOMAIN/g" "$APP_DIR/deploy/nginx/sistema-soporte.conf" > /etc/nginx/sites-available/sistema-soporte
ln -sf /etc/nginx/sites-available/sistema-soporte /etc/nginx/sites-enabled/sistema-soporte
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable --now nginx
systemctl reload nginx

echo "==> systemd API"
cp "$APP_DIR/deploy/systemd/sistema-soporte-api.service" /etc/systemd/system/
sed -i '/ExecStartPre=/d' /etc/systemd/system/sistema-soporte-api.service
systemctl daemon-reload
systemctl enable --now sistema-soporte-api

if [[ "$INTRANET" != "1" ]]; then
  echo "==> Firewall (UFW)"
  ufw allow OpenSSH
  ufw allow 'Nginx Full'
  ufw --force enable
else
  echo "==> Modo intranet: UFW omitido (gestionar firewall en red municipal)"
fi

echo "==> Cron backups"
cp "$APP_DIR/deploy/cron/sistema-soporte-backup" /etc/cron.d/sistema-soporte-backup
chmod 644 /etc/cron.d/sistema-soporte-backup

chmod +x "$APP_DIR/deploy/scripts/"*.sh

if [[ "$INTRANET" != "1" && "$DOMAIN" != "localhost" ]]; then
  echo ""
  echo "Siguiente paso — HTTPS:"
  echo "  certbot --nginx -d $DOMAIN"
fi

echo ""
echo "Instalación base completada."
echo "Edita $APP_DIR/server/.env (JWT_SECRET, EMAIL_*) y reinicia:"
echo "  systemctl restart sistema-soporte-api"
API_URL="http://127.0.0.1:5000" node "$APP_DIR/deploy/scripts/verify-prod.mjs" || true
