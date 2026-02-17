# 🔐 Flujo de Verificación de Email - Documentación Completa

## 📋 Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Flujo Paso a Paso](#flujo-paso-a-paso)
3. [Casos de Uso](#casos-de-uso)
4. [Diagrama de Decisión](#diagrama-de-decisión)
5. [Código Clave](#código-clave)

---

## 🎯 Visión General

El sistema de verificación de email funciona mediante **tokens temporales** que se envían por correo electrónico. Cada token:

- ✅ Tiene una validez de **24 horas**
- ✅ Solo puede usarse **una vez**
- ✅ Está vinculado a un **usuario específico**
- ✅ Se marca como usado después de la verificación

---

## 🔄 Flujo Paso a Paso

### **Paso 1: Usuario se Registra**

```javascript
// En register() - authController.js
const verificationToken = generarTokenVerificacion();  // Genera token único
await Token.create(user.id, verificationToken, 'email_verification', 24);  // Guarda en BD
await enviarEmailVerificacion(email, verificationToken, full_name);  // Envía email
```

**Resultado:**
- Usuario creado con `email_verified = FALSE`
- Token guardado en `tokens_verificacion` con `used = FALSE`
- Email enviado con enlace: `/verificar-email?token=abc123...`

---

### **Paso 2: Usuario Hace Clic en el Enlace**

El frontend (`VerifyEmail.tsx`) extrae el token de la URL y llama al endpoint:

```javascript
GET /api/auth/verify-email?token=abc123...
```

---

### **Paso 3: Backend Procesa la Verificación**

El controlador `verifyEmail()` ejecuta la siguiente lógica:

#### **3.1. Validación Inicial**
```javascript
let { token } = req.query;
if (!token) {
    return sendError(res, 'Token de verificación requerido');
}
```

#### **3.2. Decodificación del Token**
```javascript
token = decodeURIComponent(token);  // Convierte %2B → +
```

#### **3.3. Búsqueda de Token Válido**
```javascript
const tokenData = await Token.findValid(token, 'email_verification');
```

**¿Qué hace `Token.findValid()`?**
```sql
SELECT t.*, u.email_verified
FROM tokens_verificacion t
JOIN usuarios u ON t.user_id = u.id
WHERE t.token = ? 
  AND t.type = 'email_verification'
  AND t.used = FALSE          -- Token no usado
  AND t.expires_at > NOW()    -- Token no expirado
```

**Resultados posibles:**
- ✅ **Encuentra token válido** → `tokenData` contiene los datos
- ❌ **No encuentra** → `tokenData = null`

---

### **Paso 4: Decisión Basada en el Resultado**

#### **Caso A: Token Válido Encontrado** (`tokenData !== null`)

```javascript
// Verificar si el email ya está verificado (por si acaso)
if (tokenData.email_verified) {
    await Token.markAsUsed(token);  // Marcar como usado
    return sendSuccess(res, 'Email ya estaba verificado', { already_verified: true });
}

// Si no está verificado, proceder a verificar
await Usuario.verifyEmail(tokenData.user_id);  // UPDATE usuarios SET email_verified = TRUE
await Token.markAsUsed(token);                 // UPDATE tokens_verificacion SET used = TRUE
return sendSuccess(res, 'Email verificado exitosamente');
```

**Resultado:** ✅ Email verificado, usuario puede hacer login

---

#### **Caso B: Token No Válido** (`tokenData === null`)

Necesitamos investigar **por qué** no es válido:

```javascript
// Consulta más amplia: busca el token sin importar si está usado/expirado
const sql = `SELECT t.*, u.email_verified FROM tokens_verificacion t JOIN usuarios u ...`;
const result = await query(sql, [token, 'email_verification']);
```

**Subcasos:**

##### **B.1. Token Existe en BD**

```javascript
if (result[0]) {
    const tokenInfo = result[0];
    
    // PRIORIDAD 1: ¿Email ya verificado?
    if (tokenInfo.email_verified) {
        return sendSuccess(res, 'Tu email ya está verificado', { already_verified: true });
    }
    
    // PRIORIDAD 2: ¿Token usado?
    if (tokenInfo.used) {
        return sendError(res, 'Este token ya fue utilizado. Solicita un nuevo enlace.');
    }
    
    // PRIORIDAD 3: ¿Token expirado?
    if (new Date(tokenInfo.expires_at) < new Date()) {
        return sendError(res, 'El token ha expirado. Solicita un nuevo enlace.');
    }
}
```

##### **B.2. Token No Existe en BD**

```javascript
return sendError(res, 'Token inválido o expirado');
```

---

## 📊 Casos de Uso

### **Escenario 1: Verificación Exitosa (Primera Vez)**

```
Usuario → Clic en enlace → Token válido → Email NO verificado
→ Usuario.verifyEmail() → Token.markAsUsed()
→ ✅ "Email verificado exitosamente"
```

**Estado final:**
- `usuarios.email_verified = TRUE`
- `tokens_verificacion.used = TRUE`

---

### **Escenario 2: Usuario Hace Clic Dos Veces (Mismo Enlace)**

**Primera vez:**
```
Token válido → Email verificado → Token marcado como usado
→ ✅ "Email verificado exitosamente"
```

**Segunda vez:**
```
Token.findValid() → null (porque used = TRUE)
→ Consulta amplia → Token usado + Email verificado
→ ✅ "Tu email ya está verificado" (NO error)
```

---

### **Escenario 3: Token Expirado + Email NO Verificado**

```
Token.findValid() → null (porque expirado)
→ Consulta amplia → Token expirado + Email NO verificado
→ ❌ "El token ha expirado. Solicita un nuevo enlace."
```

**Solución:** Usuario debe ir a `/solicitar-verificacion` para obtener nuevo token.

---

### **Escenario 4: Token Usado + Email NO Verificado**

```
Token.findValid() → null (porque usado)
→ Consulta amplia → Token usado + Email NO verificado
→ ❌ "Este token ya fue utilizado. Solicita un nuevo enlace."
```

**Causa posible:** Error en verificación anterior que marcó el token pero no verificó el email.

---

### **Escenario 5: Token Expirado + Email YA Verificado**

```
Token.findValid() → null (porque expirado)
→ Consulta amplia → Email verificado
→ ✅ "Tu email ya está verificado" (prioridad al estado del email)
```

**Nota:** El sistema prioriza el estado del email sobre el estado del token.

---

## 🗺️ Diagrama de Decisión

```
                    ┌─────────────────┐
                    │  Usuario hace   │
                    │  clic en enlace │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ ¿Token en URL?  │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                   NO                SÍ
                    │                 │
                    ▼                 ▼
            ┌──────────────┐  ┌──────────────────┐
            │ Error: Token │  │ Token.findValid()│
            │  requerido   │  └────────┬──────────┘
            └──────────────┘           │
                              ┌────────┴────────┐
                              │                 │
                            NULL              VÁLIDO
                              │                 │
                              ▼                 ▼
                    ┌──────────────────┐  ┌──────────────┐
                    │ Consulta amplia  │  │ ¿Email ya    │
                    │ (sin validar)    │  │ verificado?  │
                    └────────┬─────────┘  └──────┬───────┘
                             │                   │
                    ┌────────┴────────┐   ┌──────┴──────┐
                    │                │   │             │
                 EXISTE          NO    SÍ            NO
                    │                │   │             │
                    ▼                ▼   ▼             ▼
            ┌───────────────┐  ┌────────┐  ┌──────────────┐
            │ ¿Email       │  │ Error: │  │ Marcar token │
            │ verificado?  │  │ Token  │  │ usado        │
            └──────┬───────┘  │ inválido│  └──────┬───────┘
                   │          └─────────┘         │
            ┌──────┴──────┐                        │
           SÍ           NO                         │
            │            │                         │
            ▼            ▼                         ▼
    ┌─────────────┐ ┌──────────┐        ┌─────────────────┐
    │ Éxito:      │ │ ¿Token    │        │ Verificar email  │
    │ "Email ya   │ │ usado?    │        │ Marcar token     │
    │ verificado" │ └─────┬──────┘        │ usado           │
    └─────────────┘       │               └────────┬────────┘
                  ┌───────┴──────┐                  │
                 SÍ            NO                    │
                  │             │                    │
                  ▼             ▼                    ▼
          ┌──────────┐  ┌──────────┐        ┌─────────────────┐
          │ Error:   │  │ ¿Token   │        │ Éxito: "Email   │
          │ "Token   │  │ expirado?│        │ verificado      │
          │ usado"   │  └─────┬────┘        │ exitosamente"   │
          └──────────┘        │              └─────────────────┘
                     ┌───────┴──────┐
                    SÍ            NO
                     │             │
                     ▼             ▼
              ┌──────────┐  ┌──────────┐
              │ Error:   │  │ (No debería│
              │ "Token   │  │ llegar aquí)│
              │ expirado"│  └──────────┘
              └──────────┘
```

---

## 💻 Código Clave

### **Modelo Token.findValid()**

```javascript
static async findValid(token, type) {
    const sql = `
        SELECT t.id, t.user_id, t.token, t.type, t.expires_at, t.used, t.created_at,
               u.email, u.full_name, u.email_verified
        FROM tokens_verificacion t
        JOIN usuarios u ON t.user_id = u.id
        WHERE t.token = ? 
        AND t.type = ?
        AND t.used = FALSE        -- ⚠️ Solo tokens no usados
        AND t.expires_at > NOW()  -- ⚠️ Solo tokens no expirados
    `;
    
    const result = await query(sql, [token, type]);
    if (!result[0]) return null;
    
    return {
        ...result[0],
        id: Number(result[0].id),
        user_id: Number(result[0].user_id)
    };
}
```

### **Modelo Usuario.verifyEmail()**

```javascript
static async verifyEmail(id) {
    const sql = 'UPDATE usuarios SET email_verified = TRUE WHERE id = ?';
    await query(sql, [id]);
}
```

### **Modelo Token.markAsUsed()**

```javascript
static async markAsUsed(token) {
    const sql = 'UPDATE tokens_verificacion SET used = TRUE WHERE token = ?';
    await query(sql, [token]);
}
```

---

## 🔑 Puntos Clave del Diseño

1. **Prioridad al Estado del Email**: Si el email ya está verificado, siempre retornamos éxito, sin importar el estado del token.

2. **Tokens de Un Solo Uso**: Cada token se marca como usado después de la verificación para prevenir ataques de reutilización.

3. **Mensajes Específicos**: El sistema diferencia entre "token usado", "token expirado" y "token inválido" para guiar mejor al usuario.

4. **Seguridad**: Los tokens expiran después de 24 horas para limitar la ventana de ataque.

5. **Manejo de Errores**: Cada caso tiene un mensaje apropiado que ayuda al usuario a entender qué hacer a continuación.

---

## 🧪 Testing

Para probar cada escenario:

1. **Verificación exitosa**: Usar token válido recién generado
2. **Token usado**: Usar el mismo token dos veces
3. **Token expirado**: Modificar `expires_at` en BD a una fecha pasada
4. **Token inválido**: Usar un token que no existe en BD
5. **Email ya verificado**: Verificar email manualmente en BD y luego intentar verificar con token

---

## 📝 Notas Finales

- El sistema está diseñado para ser **tolerante a fallos** y **user-friendly**
- Los mensajes de error son **específicos** y **accionables**
- La lógica prioriza **el estado del email** sobre el estado del token para evitar confusión
