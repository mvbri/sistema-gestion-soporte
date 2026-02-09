# Análisis del Error 500 en el Registro

## Resumen del Error
- **Endpoint**: `POST /api/auth/register`
- **Status Code**: `500 Internal Server Error`
- **Content-Length**: 63 bytes (respuesta JSON pequeña)

## Posibles Causas

### 1. Error de Conexión a la Base de Datos (MÁS PROBABLE)
**Síntomas:**
- Error al conectar con MariaDB
- Pool timeout
- Credenciales incorrectas
- MariaDB no está corriendo

**Diagnóstico:**
```bash
cd server
node test-connection.js
```

**Solución:**
- Verificar que MariaDB esté corriendo
- Revisar credenciales en `server/.env` (archivo no encontrado actualmente)
- Ejecutar `fix-auth.sql` si hay problemas de autenticación

### 2. Error al Crear el Usuario
**Síntomas:**
- Error en `Usuario.create()`
- Violación de restricciones (email duplicado, foreign key, etc.)
- Tabla `usuarios` no existe o tiene estructura incorrecta

**Diagnóstico:**
- Revisar logs del servidor: `console.error('Error en registro:', error)`
- Verificar que la tabla `usuarios` exista y tenga la estructura correcta

**Solución:**
- Ejecutar `server/database/schema.sql` para crear/verificar tablas
- Verificar que el email no esté duplicado

### 3. Error al Crear el Token
**Síntomas:**
- Error en `Token.create()`
- Tabla `tokens_verificacion` no existe
- Foreign key constraint violation

**Diagnóstico:**
- Revisar logs del servidor
- Verificar estructura de la tabla `tokens_verificacion`

**Solución:**
- Ejecutar `server/database/schema.sql`
- Verificar que la tabla tenga todas las columnas necesarias

### 4. Error al Enviar Email
**Síntomas:**
- Error en `enviarEmailVerificacion()`
- Configuración de email incorrecta (nodemailer)
- Variables de entorno faltantes (EMAIL_USER, EMAIL_PASS, etc.)

**Diagnóstico:**
- Revisar logs: `console.error('Error al enviar email de verificación:', error)`
- Verificar configuración de email en `server/.env`

**Solución:**
- Configurar variables de entorno de email
- O hacer que el envío de email sea opcional/no bloqueante

### 5. Falta de Archivo .env
**Síntomas:**
- No existe `server/.env`
- Variables de entorno usando valores por defecto

**Diagnóstico:**
- El código tiene valores por defecto, pero pueden no ser correctos

**Solución:**
- Crear `server/.env` con las configuraciones correctas
- Ver `server/CONFIGURAR_ENV.md` para referencia

## Problema Identificado

**Causa raíz del error 500:** El envío de email de verificación falla porque **faltan las variables de entorno de email** en el archivo `server/.env`.

**Diagnóstico realizado:**
- ✅ La conexión a la base de datos funciona correctamente
- ❌ Faltan las siguientes variables de entorno:
  - `EMAIL_USER`
  - `EMAIL_PASS`
  - `EMAIL_FROM`
  - `FRONTEND_URL`

**Qué está pasando:**
1. El usuario se registra correctamente en la base de datos
2. Se crea el token de verificación
3. Al intentar enviar el email, nodemailer falla porque no tiene credenciales (`EMAIL_USER` y `EMAIL_PASS` son `undefined`)
4. El error se propaga y causa el error 500

## Solución

### Paso 1: Crear archivo `.env`

Copia el archivo de ejemplo:
```powershell
Copy-Item server\.env.example server\.env
```

O crea manualmente `server/.env` con el contenido de `server/.env.example`

### Paso 2: Configurar variables de email

Edita `server/.env` y configura:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
EMAIL_FROM=noreply@alcaldia-angostura.gob.ve
FRONTEND_URL=http://localhost:5173
```

**Importante para Gmail:**
- `EMAIL_PASS` debe ser una **"Contraseña de aplicación"**, NO tu contraseña normal
- Obtén una en: https://myaccount.google.com/apppasswords
- Requiere tener la verificación en dos pasos activada

### Paso 3: Probar la configuración

Ejecuta el script de diagnóstico:
```bash
cd server
node test-email.js
```

Este script te dirá exactamente qué está mal y cómo solucionarlo.

### Paso 4: Reiniciar el servidor

Después de configurar el `.env`, reinicia el servidor para que cargue las nuevas variables.

## Mejoras Implementadas

1. **Validación de variables de entorno:**
   - El código ahora valida que todas las variables necesarias estén configuradas
   - Muestra mensajes de error más descriptivos

2. **Script de diagnóstico:**
   - Creado `server/test-email.js` para diagnosticar problemas de email
   - Muestra qué variables faltan y cómo solucionarlo

3. **Mensajes de error mejorados:**
   - Errores más descriptivos según el tipo de fallo (autenticación, conexión, etc.)
   - Sugerencias específicas para cada tipo de error

## Pasos para Diagnosticar (si el problema persiste)

1. **Revisar logs del servidor** (más importante):
   - Buscar en la consola donde corre el servidor
   - Buscar mensajes que empiecen con "Error en registro:" o "Error al enviar email"
   - El stack trace mostrará la línea exacta del error

2. **Probar conexión a la base de datos**:
   ```bash
   cd server
   node test-connection.js
   ```

3. **Configurar variables de entorno de email** (opcional pero recomendado):
   - Crear archivo `server/.env` con las variables necesarias
   - Ver `server/CONFIGURAR_ENV.md` para más detalles
   - Variables requeridas: `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, `FRONTEND_URL`

4. **Verificar que las tablas existan**:
   ```sql
   USE sistema_soporte;
   SHOW TABLES;
   DESCRIBE usuarios;
   DESCRIBE tokens_verificacion;
   ```

## Código Relevante

El error se captura en `server/src/controllers/authController.js` línea 52-83:
- Se registra el error completo con `console.error`
- Se muestra el stack trace
- Se muestra el estado del proceso (userId, tokenCreated, emailSent)

**Para ver el error exacto, revisa la consola del servidor donde está corriendo Node.js.**
