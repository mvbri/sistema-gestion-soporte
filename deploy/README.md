# Despliegue a producción (Vercel + nube, Venezuela)

Arquitectura **100% gratuita** sin servidor propio: frontend en Vercel, API en Render, BD en TiDB Cloud, imágenes en Cloudinary, email en SendGrid.

Ver [`HOSTING.md`](HOSTING.md) para decisiones de arquitectura y justificación.

## Orden recomendado

1. **TiDB Cloud** — cluster Starter; ver [`tidb.md`](tidb.md). Copiar host, puerto, usuario y contraseña.
2. **SendGrid** — cuenta free, Single Sender verificado, API key `SG....`; ver [`sendgrid.md`](sendgrid.md).
3. **Cloudinary** — cuenta free, copiar `CLOUDINARY_URL`; ver [`cloudinary.md`](cloudinary.md).
4. **Migraciones** — desde tu PC con `server/.env` apuntando a TiDB (ver [Entornos y `.env`](#entornos-y-archivos-env)):

```bash
cd server
cp .env.production.example .env
# editar DB_* y DB_SSL=true (no hace falta SendGrid en este paso)
npm install
npm run deploy:prepare
```

5. **Render** — Web Service, variables de [`render.md`](render.md); start: `npm run deploy:start`.
6. **Vercel** — [`vercel.md`](vercel.md); `VITE_API_URL=https://tu-api.onrender.com/api`.
7. **Verificar** — `API_URL=https://tu-api.onrender.com npm run deploy:verify` y [checklist manual](#checklist-de-verificación-manual).

## Entornos y archivos `.env`

| Uso | Archivo | Contenido principal |
|-----|---------|---------------------|
| Desarrollo local | [`server/.env`](../server/.env) (copiar de [`server/.env.example`](../server/.env.example)) | MariaDB local, Gmail SMTP, `FRONTEND_URL=http://localhost:5173`, **sin** `EMAIL_PROVIDER` ni `UPLOAD_PROVIDER` |
| Producción (Render dashboard) | Variables en Render | Ver [`server/.env.production.example`](../server/.env.production.example): TiDB, SendGrid, Cloudinary, CORS |
| Migraciones a TiDB desde PC | `server/.env` temporal | Copiar production example; rellenar solo `DB_*` y `DB_SSL=true` para `npm run deploy:prepare` |

**Importante:** no pongas `EMAIL_PROVIDER=sendgrid` en el `.env` de desarrollo local; usa Gmail SMTP.

## Documentación por servicio

| Guía | Contenido |
|------|-----------|
| [`tidb.md`](tidb.md) | Base de datos TiDB Cloud, SSL, migraciones |
| [`sendgrid.md`](sendgrid.md) | Email en producción, Single Sender, API key |
| [`cloudinary.md`](cloudinary.md) | Imágenes de tickets en producción |
| [`render.md`](render.md) | Backend, env vars, spin-down |
| [`vercel.md`](vercel.md) | Frontend, `VITE_API_URL`, dominio |

## Scripts útiles

```bash
npm run deploy:prepare-db   # migrate + schema:check
npm run deploy:verify       # /api/health
```

## Servidor propio (opcional)

Si más adelante hay un PC en la alcaldía: [`scripts/install-server.sh`](scripts/install-server.sh) + Vercel con `VITE_API_URL` al túnel o IP pública.

## Estructura

```
deploy/
├── HOSTING.md
├── README.md
├── tidb.md
├── sendgrid.md
├── cloudinary.md
├── render.md
├── vercel.md
└── scripts/

render.yaml              # Blueprint Render (raíz del repo)
server/.env.production.example
```

## Primer administrador

Tras el primer registro en producción, en TiDB:

```sql
UPDATE users SET role_id = 1 WHERE email = 'admin@alcaldia.gob.ve';
```

## Checklist de verificación manual

- [ ] `npm run deploy:verify` OK contra la URL de Render
- [ ] Login desde la URL de Vercel
- [ ] Registro o reenvío de verificación de email (SendGrid)
- [ ] Recuperación de contraseña (email con enlace)
- [ ] Crear ticket con imagen adjunta (URL absoluta Cloudinary en detalle)
- [ ] Primer request tras ~15 min inactivo (cold start Render ~1 min)
