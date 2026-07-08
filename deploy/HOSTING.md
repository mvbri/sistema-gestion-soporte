# Hosting para producción (Venezuela, sin servidor propio)

## Arquitectura: Vercel + nube gratuita

| Capa | Servicio | Costo |
|------|----------|-------|
| Frontend | [Vercel](https://vercel.com) | $0 |
| Backend API | [Render](https://render.com) Web Service free | $0 |
| Base de datos | [TiDB Cloud Starter](https://www.pingcap.com/tidb-cloud-starter/) (MySQL compatible) | $0 |
| Imágenes | [Cloudinary](https://cloudinary.com) free | $0 |
| Email | [SendGrid](https://sendgrid.com) API HTTP | $0 |

```
Usuarios → Vercel (React) → Render (Express) → TiDB + Cloudinary + SendGrid
```

## Decisiones de arquitectura

| Decisión | Motivo |
|----------|--------|
| **TiDB Cloud** (MySQL) | Compatible con migraciones y driver `mariadb` existentes; sin reescribir SQL a PostgreSQL |
| **SendGrid Single Sender** (no SMTP en Render) | API HTTP en puerto 443; verificación por email sin DNS de dominio al inicio |
| **Nodemailer + Gmail** solo en local | Desarrollo sin coste |
| **Cloudinary** en producción | Disco efímero en Render free |
| **Vercel + Render** | Frontend estático + API Node; Vercel no hospeda Express ni MariaDB |
| **No Oracle Cloud** | Restricciones de acceso desde Venezuela |
| **No Render Postgres free** | Caduca ~30 días; no es MySQL/MariaDB compatible con el proyecto |

## Por qué esta combinación

- **Vercel**: ya configurado en [`vercel.json`](../vercel.json); funciona para desarrolladores y usuarios en Venezuela (si falla `.vercel.app`, usar dominio propio).
- **Render**: ejecuta Node/Express; HTTPS en puerto 443 (sin bloqueo de API).
- **TiDB**: MySQL compatible, registro con GitHub sin tarjeta; `DB_SSL=true`.
- **Cloudinary**: Render free tiene disco efímero; las imágenes deben estar en almacenamiento externo.
- **SendGrid**: Render free **bloquea SMTP 587**; el email va por API HTTP (puerto 443).

## Variables por entorno

| Entorno | Email | Uploads | CAPTCHA | Base de datos |
|---------|-------|---------|---------|---------------|
| **Local** (`server/.env`, `client/.env`) | Sin `EMAIL_PROVIDER` → Gmail SMTP | Sin `UPLOAD_PROVIDER` → `server/uploads/` | Claves de prueba `1x...` | MariaDB local, `DB_SSL=false` |
| **Render + Vercel** | `EMAIL_PROVIDER=sendgrid`, `SENDGRID_API_KEY` | `UPLOAD_PROVIDER=cloudinary` | `TURNSTILE_SECRET_KEY` (Render) + `VITE_TURNSTILE_SITE_KEY` (Vercel) | TiDB, `DB_SSL=true` |

Plantilla producción: [`server/.env.production.example`](../server/.env.production.example).

## No usar en este escenario

- Oracle Cloud (bloqueado para Venezuela).
- Gmail SMTP en Render (puertos bloqueados).
- Solo Vercel (no hospeda Express + MariaDB).
- Disco local en Render para `uploads/` (se pierde al reiniciar).
- PostgreSQL / Render Postgres free como sustituto de TiDB (requiere reescribir migraciones y modelos).

## Limitaciones

- Render free **se duerme** tras ~15 min sin tráfico (~1 min en el primer request).
- Cloudinary free: cupo mensual limitado.
- SendGrid free: cupo diario limitado (revisar plan en sendgrid.com).
- Probar migraciones en TiDB antes de producción.

## Guías

- Paso a paso: [`README.md`](README.md)
- Base de datos: [`tidb.md`](tidb.md)
- Email: [`sendgrid.md`](sendgrid.md)
- Imágenes: [`cloudinary.md`](cloudinary.md)
- CAPTCHA: [`turnstile.md`](turnstile.md)
- Backend: [`render.md`](render.md)
- Frontend: [`vercel.md`](vercel.md)
- Servidor propio (opcional): [`scripts/install-server.sh`](scripts/install-server.sh)
