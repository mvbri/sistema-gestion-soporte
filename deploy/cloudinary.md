# Cloudinary (imágenes en producción)

Las imágenes de tickets se suben a Cloudinary en Render porque el disco del plan free es **efímero** (se pierde al reiniciar).

En desarrollo local las imágenes se guardan en `server/uploads/` sin configurar `UPLOAD_PROVIDER`.

## Registro

1. [cloudinary.com](https://cloudinary.com) → Sign up (free).
2. Dashboard → **API Keys** o **Product environment credentials**.
3. Copiar **CLOUDINARY_URL** (formato `cloudinary://api_key:api_secret@cloud_name`).

## Variables (Render)

```env
UPLOAD_PROVIDER=cloudinary
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
# Opcional:
# CLOUDINARY_FOLDER=sistema-soporte/tickets
```

## Local (desarrollo)

No definir `UPLOAD_PROVIDER`. El backend usa disco en [`server/uploads/`](../server/uploads/).

## Verificación

1. Crear un ticket con imagen adjunta desde la app en Vercel.
2. Abrir el detalle del ticket: la URL de la imagen debe ser absoluta (`https://res.cloudinary.com/...`).
3. Reiniciar el servicio en Render y comprobar que la imagen sigue visible.

## Límites

El plan free tiene cupo mensual de almacenamiento y transformaciones. Revisar uso en el dashboard de Cloudinary.
