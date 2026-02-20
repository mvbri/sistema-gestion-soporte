# Guía de Despliegue en Vercel

## Configuración del Proyecto

Este proyecto está configurado como monorepo con el frontend en `client/` y backend en `server/`.

## Pasos para Desplegar

### Opción 1: Configuración Automática (Recomendada)

1. **Conectar el repositorio a Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub/GitLab/Bitbucket

2. **Configurar el proyecto**
   - **Root Directory**: Configura `client` como directorio raíz
   - **Framework Preset**: Vite (se detecta automáticamente)
   - **Build Command**: `npm run build` (se ejecuta desde `client/`)
   - **Output Directory**: `dist`

3. **Variables de Entorno**
   - Agrega `VITE_API_URL` con la URL de tu backend desplegado
   - Ejemplo: `VITE_API_URL=https://tu-backend.railway.app/api`

### Opción 2: Usando vercel.json (Ya configurado)

El archivo `vercel.json` en la raíz ya está configurado para:
- Construir desde `client/`
- Servir los archivos desde `client/dist/`
- Manejar rutas SPA (Single Page Application)

**Importante**: Si usas esta opción, NO configures "Root Directory" en Vercel, déjalo en la raíz del proyecto.

## Configuración del Backend

El backend debe desplegarse por separado en otro servicio:
- **Railway**: Recomendado para Node.js
- **Render**: Alternativa gratuita
- **Heroku**: Opción tradicional
- **Vercel Serverless**: Si migras a funciones serverless

### Variables de Entorno del Backend

Asegúrate de configurar:
- `FRONTEND_URL`: URL de tu frontend en Vercel
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`

## Solución de Problemas

### Error: NOT_FOUND

**Causa**: Vercel no encuentra el directorio de build o la configuración es incorrecta.

**Solución**:
1. Verifica que `vercel.json` esté en la raíz del proyecto
2. O configura "Root Directory" a `client` en la UI de Vercel
3. Verifica que el build se complete correctamente

### Error: Build Failed

**Causa**: Dependencias faltantes o errores de TypeScript.

**Solución**:
1. Ejecuta `npm run build` localmente en `client/` para ver errores
2. Verifica que todas las dependencias estén en `package.json`
3. Revisa los logs de build en Vercel

### Las rutas no funcionan (404 en rutas como /dashboard)

**Causa**: Falta la configuración de rewrites para SPA.

**Solución**: El `vercel.json` ya incluye los rewrites necesarios. Si persiste, verifica que el archivo esté en la raíz.

## Estructura Esperada

```
proyecto/
├── vercel.json          # Configuración de Vercel
├── client/
│   ├── dist/            # Output del build (generado)
│   ├── src/
│   └── package.json
└── server/              # Backend (desplegar por separado)
```
