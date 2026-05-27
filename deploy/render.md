# Despliegue del backend en Render

## Crear Web Service

1. [dashboard.render.com](https://dashboard.render.com) → New → Web Service.
2. Conectar el repositorio Git.
3. Configuración:

| Campo | Valor |
|-------|--------|
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm install --omit=dev` |
| Start Command | `npm run deploy:start` |
| Plan | Free |

O usar Blueprint: [`render.yaml`](../render.yaml) en la raíz del repo.

## Variables de entorno (Render)

Copiar desde [`server/.env.production.example`](../server/.env.production.example).

Mínimas:

```env
NODE_ENV=production
PORT=5000

DB_HOST=<tidb-host>
DB_PORT=4000
DB_USER=<tidb-user>
DB_PASSWORD=<tidb-password>
DB_NAME=sistema_soporte
DB_SSL=true

JWT_SECRET=<openssl rand -base64 48>

FRONTEND_URL=https://tu-app.vercel.app
CORS_ORIGINS=https://tu-app.vercel.app
CORS_ALLOW_VERCEL_PREVIEWS=true

EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG....
EMAIL_FROM=Sistema de Soporte <tu@email-verificado-en-sendgrid.com>

UPLOAD_PROVIDER=cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

Detalle de email: [`sendgrid.md`](sendgrid.md). Detalle de imágenes: [`cloudinary.md`](cloudinary.md).

## Email y uploads: producción vs local

| | Producción (Render) | Desarrollo local |
|--|---------------------|------------------|
| Email | `EMAIL_PROVIDER=sendgrid` + `SENDGRID_API_KEY` | Sin `EMAIL_PROVIDER`; Gmail SMTP |
| Imágenes | `UPLOAD_PROVIDER=cloudinary` | Disco `server/uploads/` |

## Migraciones

`npm run deploy:start` ejecuta `deploy:prepare` (migrate + schema:check) antes de arrancar.

Primera vez: puedes ejecutar migraciones desde tu PC apuntando al `.env` de TiDB:

```bash
cd server
npm run deploy:prepare
```

## Limitaciones del plan free

- **Spin-down** tras 15 min sin tráfico; primer request ~1 min.
- **SMTP bloqueado** → usar `EMAIL_PROVIDER=sendgrid`, no Gmail SMTP.
- **Disco efímero** → usar `UPLOAD_PROVIDER=cloudinary`.

## Verificación

```bash
API_URL=https://tu-api.onrender.com npm run deploy:verify
```

Health: `GET https://tu-api.onrender.com/api/health`
