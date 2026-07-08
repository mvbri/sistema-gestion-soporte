# SendGrid (email en producción)

Usado en Render con `EMAIL_PROVIDER=sendgrid`. En local se usa Gmail SMTP (nodemailer); ver [`HOSTING.md`](HOSTING.md#variables-por-entorno).

## Registro

1. [sendgrid.com](https://sendgrid.com) → Sign up.
2. **Settings → API Keys** → Create API Key (permiso **Mail Send**).
3. **Settings → Sender Authentication → Single Sender Verification** → Create.
4. Completa el formulario con tu email (ej. Gmail o institucional) y confirma el enlace que envían.

No hace falta verificar un dominio completo con DNS para empezar; el **Single Sender** basta para enviar desde ese email.

## Variables (Render)

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxx
EMAIL_FROM=Sistema de Soporte <tu@email-verificado-en-sendgrid.com>
```

`EMAIL_FROM` debe coincidir con el email del Single Sender verificado (formato `Nombre <email@dominio>` o solo el email).

## Plan free

Revisa el cupo en [sendgrid.com/pricing](https://sendgrid.com/pricing) (suele ser ~100 emails/día en free; puede cambiar).

## Local (desarrollo)

**No** definir `EMAIL_PROVIDER` en `server/.env`. Usar Gmail:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu@gmail.com
EMAIL_PASS=contraseña_de_aplicacion
EMAIL_FROM=tu@gmail.com
FRONTEND_URL=http://localhost:5173
```

Render bloquea SMTP 587; en producción siempre `EMAIL_PROVIDER=sendgrid`.

## Errores frecuentes

| Error | Causa | Solución |
|-------|--------|----------|
| Toast **"Forbidden"** al registrarse | Turnstile pasó pero SendGrid rechazó el envío (403) | Revisar `SENDGRID_API_KEY` y que `EMAIL_FROM` coincida con el Single Sender verificado |
| 401 / 403 | API key incorrecta o sin permiso Mail Send | Regenerar key con permiso de envío |
| The from address does not match | `EMAIL_FROM` distinto del Single Sender | Usar exactamente el email verificado |
| Email no llega | Spam o sender no verificado | Completar verificación Single Sender; revisar carpeta spam |
| Funciona en local, falla en Render | Falta `SENDGRID_API_KEY` en Render | Añadir variables en el dashboard |

## Verificación

1. Registro de usuario nuevo → email de verificación.
2. “Olvidé mi contraseña” → email con enlace.
3. SendGrid → **Activity** → estado `Delivered` o error.
