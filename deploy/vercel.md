# Despliegue del frontend en Vercel

## Requisitos

- Cuenta en [vercel.com](https://vercel.com) (GitHub recomendado).
- Backend ya desplegado en Render con URL pública (`https://xxx.onrender.com`).

## Pasos

1. Importar el repositorio en Vercel.
2. El proyecto usa [`vercel.json`](../vercel.json) en la raíz:
   - Build: `cd client && npm install && npm run build`
   - Output: `client/dist`
3. **Environment Variables** (Production y Preview):

| Variable | Ejemplo |
|----------|---------|
| `VITE_API_URL` | `https://sistema-soporte-api.onrender.com/api` |
| `VITE_TURNSTILE_SITE_KEY` | Site Key de [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) |

Guía completa de Turnstile: [`turnstile.md`](turnstile.md).

4. Deploy.

### Turnstile (CAPTCHA) — obligatorio

Sin `VITE_TURNSTILE_SITE_KEY` el registro muestra: *"Verificación de seguridad no disponible. Contacta al administrador."*

1. Crear sitio en Cloudflare Turnstile con el dominio de Vercel (ej. `tu-app.vercel.app`).
2. Copiar la **Site Key** en Vercel como `VITE_TURNSTILE_SITE_KEY`.
3. Copiar la **Secret Key** en Render como `TURNSTILE_SECRET_KEY` (ver [`render.md`](render.md)).
4. Tras añadir la variable, hacer **Redeploy** en Vercel (Vite incluye `VITE_*` solo en el build).

## CORS en Render

En el backend (Render), configura:

```env
FRONTEND_URL=https://tu-proyecto.vercel.app
CORS_ORIGINS=https://tu-proyecto.vercel.app
CORS_ALLOW_VERCEL_PREVIEWS=true
```

Tras cada deploy de preview, si la URL cambia, añádela a `CORS_ORIGINS` separada por comas (o usa `CORS_ALLOW_VERCEL_PREVIEWS=true`).

## Dominio propio (recomendado en Venezuela)

Si `.vercel.app` es lento o inaccesible desde algunas redes:

1. Vercel → Settings → Domains → añadir `soporte.tu-dominio.gob.ve`.
2. Configurar DNS según indique Vercel.
3. Actualizar `FRONTEND_URL` y `CORS_ORIGINS` en Render.

## Verificación

1. Abrir la URL de Vercel e iniciar sesión (DevTools → Network → peticiones a `/api/...` en Render).
2. **Registro** → widget Turnstile visible; tras enviar, email vía SendGrid (revisar bandeja y Activity en SendGrid).
3. **Recuperación de contraseña** (email) y **reenvío de verificación** → Turnstile + correo SendGrid.
4. **Ticket con imagen** → URL absoluta de Cloudinary en el detalle del ticket.
5. Tras ~15 min sin uso del API, el primer request puede tardar ~1 min (cold start de Render).
