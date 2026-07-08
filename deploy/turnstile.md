# Cloudflare Turnstile (CAPTCHA en producción)

Protege el **registro**, el **reenvío de verificación de email** y la **recuperación de contraseña por email** contra bots y abuso automatizado.

Requiere **dos claves** (par site key + secret key) del mismo sitio en Cloudflare.

## Registro en Cloudflare

1. [Cloudflare Dashboard → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. **Add site**
3. **Site name**: ej. `Sistema Soporte`
4. **Domain**: dominio(s) donde corre el frontend, por ejemplo:
   - `tu-app.vercel.app`
   - `soporte.tu-dominio.gob.ve` (si usas dominio propio)
   - Para previews de Vercel puedes añadir `*.vercel.app` o el dominio concreto del preview
5. **Widget mode**: **Managed** (recomendado)
6. Crear → copiar:
   - **Site Key** → frontend (Vercel)
   - **Secret Key** → backend (Render)

## Variables por entorno

| Variable | Dónde | Descripción |
|----------|--------|-------------|
| `VITE_TURNSTILE_SITE_KEY` | **Vercel** (opcional) | Clave pública embebida en el build de Vite |
| `TURNSTILE_SITE_KEY` | **Render** (**obligatoria**) | Misma Site Key; el frontend la obtiene vía `GET /api/auth/public-config` si no estuvo en el build |
| `TURNSTILE_SECRET_KEY` | **Render** | Clave secreta para validar tokens en el API |

### Vercel (frontend)

Settings → Environment Variables → **Production** (y Preview si aplica):

```env
VITE_TURNSTILE_SITE_KEY=0x4AAAAAAA...
```

**Importante:** las variables `VITE_*` se incluyen en el **build** de Vite. Tras añadir o cambiar la clave debes hacer **Redeploy** (Deployments → ⋮ → Redeploy). Un deploy anterior seguirá sin CAPTCHA aunque la variable ya exista en el dashboard.

### Render (backend)

```env
TURNSTILE_SITE_KEY=0x4AAAAAAA...
TURNSTILE_SECRET_KEY=0x4AAAAAAA...
```

Render reinicia el servicio al guardar. Site key y secret key deben ser del **mismo sitio** creado en Cloudflare.

**Nota:** si no configuras `VITE_TURNSTILE_SITE_KEY` en Vercel, el frontend carga la site key en runtime desde `GET /api/auth/public-config`. Basta con `TURNSTILE_SITE_KEY` en Render y un redeploy del frontend con este código.

## Local (desarrollo)

Copiar [`client/.env.example`](../client/.env.example) a `client/.env`:

```env
VITE_API_URL=/api
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

En [`server/.env`](../server/.env):

```env
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

Las claves `1x...` son las **oficiales de prueba** de Cloudflare; siempre pasan en local. Reinicia `npm run dev:client` y `npm run dev:server` tras crear los archivos.

## Dónde se usa en la app

| Pantalla | Frontend | Backend |
|----------|----------|---------|
| Registro | `Register.tsx` | `POST /auth/register` |
| Reenvío de verificación | `RequestVerification.tsx` | `POST /auth/resend-verification` |
| Recuperación por email | `RequestPasswordRecovery.tsx` | `POST /auth/request-recovery` |

Middleware: [`server/src/middleware/validateTurnstile.js`](../server/src/middleware/validateTurnstile.js).

## Errores frecuentes

| Síntoma | Causa | Solución |
|---------|--------|----------|
| **"Verificación de seguridad no disponible. Contacta al administrador."** | Falta `VITE_TURNSTILE_SITE_KEY` en Vercel o no se redeployó el frontend | Añadir variable en Vercel y **Redeploy** |
| **"No es posible conectarse al sitio web"** (dentro del widget) | Dominio no autorizado en Cloudflare (**110200**) o red bloquea `challenges.cloudflare.com` (**200500**) | Ver sección [Hostname en Cloudflare](#hostname-en-cloudflare-obligatorio) |
| Widget visible pero no valida al enviar | Site key y secret key de sitios distintos | Usar el par del mismo widget en Cloudflare |
| **"No se pudo verificar la seguridad..."** | Falta `TURNSTILE_SECRET_KEY` en Render | Añadir secret key en el dashboard de Render |
| Funciona en local, falla en producción | Claves de prueba (`1x...`) en prod o dominio no autorizado | Crear sitio real en Cloudflare con el dominio de Vercel |

## Hostname en Cloudflare (obligatorio)

Si el widget muestra **"No es posible conectarse al sitio web"**, casi siempre falta autorizar el dominio exacto de Vercel.

1. [Cloudflare → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) → selecciona tu widget (el de la Site Key `0x4...` que usas en Vercel).
2. **Hostname Management** → **Add hostname**.
3. Añade el dominio **exacto** de tu app, sin `https://`:
   ```
   sistema-gestion-soporte.vercel.app
   ```
4. Guarda y espera 1–2 minutos.
5. Recarga la página de registro (Ctrl+F5).

**Importante:**
- No uses `https://` ni rutas (`/registro`).
- Si cambias el dominio en Vercel (preview o dominio propio), añade también ese hostname.
- `vercel.app` genérico no sirve; debe ser **tu subdominio concreto**.
- Si persiste, prueba otra red o desactiva bloqueadores: el error **200500** indica que `challenges.cloudflare.com` no carga.

## Verificación manual

1. Abrir la URL de producción → **Registrarse**
2. Debe aparecer el widget de Cloudflare Turnstile (no el mensaje rojo de error)
3. Completar el formulario → registro exitoso y email de verificación enviado
4. Probar también **Recuperar contraseña** (método email) y **Reenviar verificación**
