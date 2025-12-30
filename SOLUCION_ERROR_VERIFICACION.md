# Solución: Error al Verificar Email

## Diagnóstico del Problema

Cuando ves el error "Error al verificar email", puede deberse a varias causas. Sigue estos pasos para identificar el problema:

### Paso 1: Obtener el Token del Email

1. Abre el email de verificación que recibiste
2. Copia el token completo de la URL
3. El token está en: `http://localhost:5173/verificar-email?token=XXXXX`
4. Copia solo la parte `XXXXX` (el token)

### Paso 2: Diagnosticar el Token

Ejecuta este comando reemplazando `TU_TOKEN` con el token que copiaste:

```bash
cd server
npm run diagnostico:token TU_TOKEN
```

O directamente:

```bash
node diagnostico-verificacion.js TU_TOKEN
```

Este script te dirá:
- ✅ Si el token existe
- ✅ Si el token está expirado
- ✅ Si el token ya fue usado
- ✅ Si el email ya está verificado
- ✅ Si el token es válido

### Paso 3: Revisar los Logs del Servidor

Cuando intentas verificar el email, revisa la consola del servidor. Deberías ver:

**Si funciona:**
```
🔍 Verificando token: abc123...
✅ Token válido para usuario ID: 1
✅ Email verificado exitosamente para usuario ID: 1
```

**Si hay error:**
```
❌ Error en verificación de email:
   Token: abc123...
   Error: [mensaje específico]
```

## Causas Comunes y Soluciones

### 1. ❌ Token Expirado

**Síntoma:** El script de diagnóstico dice "Token EXPIRADO"

**Solución:**
- Los tokens expiran después de 24 horas
- Solicita un nuevo email de verificación desde `/solicitar-verificacion`

### 2. ❌ Token Ya Fue Usado

**Síntoma:** El script dice "Token YA FUE USADO"

**Solución:**
- Este token ya se usó para verificar el email
- Si el email ya está verificado, puedes iniciar sesión normalmente
- Si no está verificado, solicita un nuevo email

### 3. ❌ Token No Existe

**Síntoma:** El script dice "Token no encontrado"

**Solución:**
- El token puede haber sido eliminado
- El formato del token puede estar incorrecto
- Solicita un nuevo email de verificación

### 4. ❌ Error de Base de Datos

**Síntoma:** Error en los logs del servidor relacionado con SQL

**Solución:**
- Verifica que MariaDB esté corriendo
- Verifica la conexión a la base de datos
- Revisa `server/SOLUCION_ERROR_DB.md`

### 5. ❌ Email Ya Verificado

**Síntoma:** El script dice "Email YA ESTÁ VERIFICADO"

**Solución:**
- El email ya fue verificado anteriormente
- Puedes iniciar sesión normalmente
- No necesitas verificar de nuevo

## Pasos de Solución Rápida

### Opción 1: Solicitar Nuevo Email

1. Ve a: `http://localhost:5173/solicitar-verificacion`
2. Ingresa tu email
3. Haz clic en "Enviar Email de Verificación"
4. Espera el nuevo email
5. Usa el nuevo token para verificar

### Opción 2: Verificar Manualmente en la Base de Datos

Si tienes acceso a la base de datos, puedes verificar el email manualmente:

```sql
-- Ver el estado del usuario
SELECT id, email, email_verified FROM usuarios WHERE email = 'tu_email@ejemplo.com';

-- Verificar el email manualmente
UPDATE usuarios SET email_verified = TRUE WHERE email = 'tu_email@ejemplo.com';
```

## Verificar que Funciona

Después de solucionar el problema:

1. Intenta verificar el email de nuevo
2. Deberías ver: "Email verificado exitosamente"
3. Serás redirigido al login
4. Podrás iniciar sesión normalmente

## Notas Importantes

- Los tokens expiran en 24 horas
- Cada token solo se puede usar una vez
- Si el email ya está verificado, no necesitas verificar de nuevo
- Siempre revisa los logs del servidor para más detalles

