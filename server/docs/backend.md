# Documentación del Backend - Sistema de Gestión de Soporte Técnico

## 📋 Índice

1. [Arquitectura y Estructura](#arquitectura-y-estructura)
2. [Configuración](#configuración)
3. [Arquitectura de Capas](#arquitectura-de-capas)
4. [Seguridad](#seguridad)
5. [Validación de Datos](#validación-de-datos)
6. [Manejo de Errores](#manejo-de-errores)
7. [Base de Datos](#base-de-datos)
8. [Servicios de Email](#servicios-de-email)
9. [Buenas Prácticas Implementadas](#buenas-prácticas-implementadas)
10. [Guía de Desarrollo](#guía-de-desarrollo)

---

## 🏗️ Arquitectura y Estructura

### Estructura de Carpetas

```
server/
├── src/
│   ├── config/          # Configuraciones (DB, Email, Upload)
│   ├── controllers/     # Manejo de peticiones y respuestas HTTP
│   ├── models/          # Modelos de datos (interacción con DB)
│   ├── routes/          # Definición de rutas y endpoints
│   ├── utils/           # Utilidades (JWT, validadores, helpers)
│   └── index.js         # Punto de entrada del servidor
├── database/            # Scripts SQL (schema, migraciones)
├── uploads/             # Archivos subidos por usuarios
├── docs/                # Documentación del backend
└── package.json
```

### Principios de Diseño

- **Separación de Responsabilidades**: Cada capa tiene una función específica
- **DRY (Don't Repeat Yourself)**: Funciones reutilizables en `utils/`
- **Single Responsibility**: Cada función hace una sola cosa
- **Middleware Pattern**: Validación y autenticación como middleware

---

## ⚙️ Configuración

### Variables de Entorno

El proyecto utiliza `.env` para configuraciones sensibles. **NUNCA** subir este archivo a GitHub.

**Variables Requeridas:**

```env
# Servidor
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Base de Datos (MariaDB)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=sistema_soporte

# JWT
JWT_SECRET=tu_secret_super_seguro_minimo_32_caracteres
JWT_EXPIRES_IN=7d

# Email (Nodemailer - Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_FROM=tu_email@gmail.com
```

### Configuración de Base de Datos

**Archivo:** `src/config/database.js`

- **Pool de Conexiones**: Reutiliza conexiones para mejor rendimiento
- **Connection Limit**: 5 conexiones simultáneas
- **Timeouts**: 30 segundos para adquirir y ejecutar consultas

```javascript
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
    acquireTimeout: 30000,
    timeout: 30000
});
```

### Configuración de Email

**Archivo:** `src/config/email.js`

- **Desarrollo** (`EMAIL_PROVIDER` no definido): nodemailer + Gmail SMTP (`EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`)
- **Producción** (`EMAIL_PROVIDER=sendgrid`): API HTTP vía [`src/lib/sendgridEmail.js`](../src/lib/sendgridEmail.js) (Render bloquea SMTP)
- **Dispatch**: `dispatchEmail()` enruta a SendGrid o SMTP según el entorno
- **Plantillas HTML**: Inline en `enviarEmailVerificacion`, `enviarEmailRecuperacion`, `enviarEmailAsignacion`

Ver [`../../deploy/sendgrid.md`](../../deploy/sendgrid.md) y [`../../deploy/HOSTING.md`](../../deploy/HOSTING.md).

---

## 🎯 Arquitectura de Capas

### Flujo de Petición

```
Cliente → Routes → Middleware (Validación/Auth) → Controllers → Models → DB
                                                              ↓
                                                         Response
```

### 1. Routes (Rutas)

**Ubicación:** `src/routes/`

Define los endpoints y aplica middleware de validación y autenticación.

**Ejemplo:**
```javascript
router.post('/register', validateRegistro, register);
router.get('/current-user', authenticate, getCurrentUser);
```

**Archivos:**
- `authRoutes.js` - Autenticación y registro
- `ticketRoutes.js` - Gestión de tickets
- `adminRoutes.js` - Funciones administrativas

### 2. Controllers (Controladores)

**Ubicación:** `src/controllers/`

Maneja la lógica de peticiones HTTP: recibe datos, llama a servicios/models, y responde.

**Responsabilidades:**
- Validar datos recibidos (ya validados por middleware)
- Llamar a modelos o servicios
- Formatear respuestas
- Manejar errores específicos del endpoint

**Ejemplo:**
```javascript
export const register = async (req, res) => {
    try {
        const { email, password, full_name } = req.body;
        // Lógica de registro
        return sendSuccess(res, 'Usuario registrado', userData);
    } catch (error) {
        return sendError(res, error.message, null, 500);
    }
};
```

### 3. Models (Modelos)

**Ubicación:** `src/models/`

Interacción directa con la base de datos. Contiene las consultas SQL.

**Responsabilidades:**
- Ejecutar consultas SQL
- Mapear resultados de DB a objetos JavaScript
- Manejar transacciones si es necesario

**Ejemplo:**
```javascript
export const crearUsuario = async (userData) => {
    const sql = `INSERT INTO users (email, password_hash, full_name) 
                 VALUES (?, ?, ?)`;
    const result = await query(sql, [email, passwordHash, fullName]);
    return result.insertId;
};
```

### 4. Services (Servicios) - Opcional

Para lógica de negocio compleja que no pertenece a controllers ni models.

**Ejemplo de uso:**
- Envío de emails después de crear un ticket
- Cálculos complejos
- Integraciones con APIs externas

---

## 🔒 Seguridad

### JWT (JSON Web Tokens)

**Archivo:** `src/utils/jwt.js`

**Buenas Prácticas Implementadas:**

1. **Payload Mínimo**: Solo incluye `id` y `email` (nunca contraseñas ni datos sensibles)
2. **Expiración Configurable**: Por defecto 7 días (ajustable en `.env`)
3. **Secret Seguro**: Debe ser mínimo 32 caracteres aleatorios

**Funciones:**
- `generarToken(payload)` - Crea un JWT firmado
- `verificarToken(token)` - Valida y decodifica un token
- `authenticate` - Middleware para proteger rutas

**Uso:**
```javascript
// Generar token
const token = generarToken({ id: user.id, email: user.email });

// Middleware de autenticación
router.get('/protected', authenticate, controller);
```

### Bcryptjs (Hashing de Contraseñas)

**Configuración:**
- **Salt Rounds**: 10 (balance entre seguridad y rendimiento)
- **Nunca almacenar contraseñas en texto plano**

**Uso:**
```javascript
import bcrypt from 'bcryptjs';

// Hash de contraseña
const passwordHash = await bcrypt.hash(password, 10);

// Verificar contraseña
const isValid = await bcrypt.compare(password, passwordHash);
```

### Middleware de Autenticación

**Archivo:** `src/utils/jwt.js`

Protege rutas que requieren autenticación:

```javascript
export const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.substring(7);
    const decoded = verificarToken(token);
    req.user = decoded; // Disponible en controllers
    next();
};
```

### Seguridad HTTP

**Implementado en:** `src/index.js`

- **CORS**: Configurado para permitir solo el frontend especificado
- **JSON Limit**: Express limita el tamaño de JSON entrantes
- **Helmet** (recomendado): Agregar para proteger cabeceras HTTP

**Mejora Recomendada:**
```javascript
import helmet from 'helmet';
app.use(helmet());
```

---

## ✅ Validación de Datos

### Express Validator

**Archivo:** `src/utils/validators.js`

**Filosofía:** Validación temprana como middleware, antes de llegar al controlador.

### Validadores Disponibles

1. **`validateRegistro`** - Registro de usuarios
   - Nombre completo (3-255 caracteres, solo letras)
   - Email válido
   - Contraseña (mínimo 8 caracteres, mayúscula, minúscula, número)
   - Teléfono opcional
   - Departamento opcional

2. **`validateLogin`** - Inicio de sesión
   - Email válido
   - Contraseña requerida

3. **`validateRecuperacionPassword`** - Solicitud de recuperación
   - Email válido

4. **`validateRestablecerPassword`** - Restablecer contraseña
   - Contraseña con mismos requisitos que registro

5. **`validateCreateTicket`** - Crear ticket
   - Título (5-255 caracteres)
   - Descripción (mínimo 20 caracteres)
   - Área de incidente
   - Categoría y prioridad (IDs válidos)

6. **`validateUpdateTicket`** - Actualizar ticket
   - Todos los campos opcionales
   - Mismos requisitos si se proporcionan

7. **`validateComment`** - Comentarios
   - Contenido (mínimo 5 caracteres)

### Middleware de Manejo de Errores

```javascript
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }
    next();
};
```

**Uso en Rutas:**
```javascript
router.post('/register', validateRegistro, register);
// validateRegistro ya incluye handleValidationErrors al final
```

---

## 🚨 Manejo de Errores

### Middleware Global de Errores

**Archivo:** `src/index.js`

```javascript
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
```

### Response Handler

**Archivo:** `src/utils/responseHandler.js`

Funciones auxiliares para respuestas consistentes:

- `sendSuccess(res, message, data, statusCode = 200)`
- `sendError(res, message, error, statusCode = 500)`

**Uso en Controllers:**
```javascript
try {
    const result = await someOperation();
    return sendSuccess(res, 'Operación exitosa', result);
} catch (error) {
    return sendError(res, error.message, null, 500);
}
```

### Reglas de Manejo de Errores

1. **Nunca usar try-catch vacío**: Siempre registrar o manejar el error
2. **Errores específicos**: Usar códigos HTTP apropiados (400, 401, 404, 500)
3. **No exponer detalles en producción**: Solo mostrar mensajes genéricos
4. **Logging**: Registrar errores para debugging

---

## 🗄️ Base de Datos

### MariaDB

**Configuración:** `src/config/database.js`

### Convenciones de Nomenclatura

- **Tablas**: Plural, snake_case (ej: `users`, `tickets`, `ticket_comentarios`)
- **Columnas**: snake_case (ej: `full_name`, `created_at`, `user_id`)
- **Llaves Foráneas**: `{tabla}_id` (ej: `user_id`, `ticket_id`)

### Pool de Conexiones

**Ventajas:**
- Reutiliza conexiones existentes
- Mejor rendimiento
- Control de límites de conexión

**Uso:**
```javascript
import { query, getConnection } from '../config/database.js';

// Para consultas simples
const results = await query('SELECT * FROM users WHERE id = ?', [userId]);

// Para transacciones
const conn = await getConnection();
try {
    await conn.beginTransaction();
    // ... operaciones ...
    await conn.commit();
} catch (error) {
    await conn.rollback();
    throw error;
} finally {
    conn.release();
}
```

### Relaciones y Índices

**Buenas Prácticas:**
- Definir FOREIGN KEYS para integridad referencial
- Crear índices en columnas frecuentemente consultadas (ej: `email`, `user_id`)
- Usar `ON DELETE CASCADE` o `ON DELETE SET NULL` según corresponda

---

## 📧 Servicios de Email

### Nodemailer

**Archivo:** `src/config/email.js`

**Configuración:**
- Gmail SMTP (gratuito)
- STARTTLS en puerto 587
- Verificación de conexión al iniciar

### Funciones Disponibles

1. **`enviarEmailVerificacion(email, token, name)`**
   - Envía email de verificación 2FA
   - Token expira en 24 horas
   - Incluye enlace de verificación

2. **`enviarEmailRecuperacion(email, token, name)`**
   - Envía email de recuperación de contraseña
   - Token expira en 1 hora
   - Incluye enlace de restablecimiento

3. **`enviarEmailAsignacion(email, name, ticketTitulo, ticketId)`**
   - Notifica a técnico sobre ticket asignado
   - Incluye enlace al ticket

### Mejoras Recomendadas

- Usar motor de plantillas (Handlebars) para emails
- Separar plantillas HTML en archivos `.html`
- Agregar soporte para múltiples proveedores de email

---

## ✨ Buenas Prácticas Implementadas

### 1. Estructura de Carpetas

✅ Separación clara de responsabilidades
✅ No mezclar lógica de diferentes capas
✅ Archivos organizados por funcionalidad

### 2. Manejo de Errores

✅ Middleware global de errores
✅ Try-catch en operaciones asíncronas
✅ Respuestas de error consistentes
✅ Logging de errores

### 3. Variables de Entorno

✅ Uso de `.env` para configuración
✅ Valores por defecto cuando es apropiado
✅ Nunca exponer credenciales en código

### 4. Seguridad

✅ JWT con payload mínimo
✅ Contraseñas hasheadas con bcryptjs
✅ Validación temprana de datos
✅ Middleware de autenticación

### 5. Base de Datos

✅ Pool de conexiones
✅ Convenciones de nomenclatura consistentes
✅ Consultas parametrizadas (prevención de SQL injection)

### 6. Validación

✅ Express Validator como middleware
✅ Validación antes de llegar al controlador
✅ Mensajes de error descriptivos

---

## 📝 Guía de Desarrollo

### Agregar un Nuevo Endpoint

1. **Definir la ruta** en `src/routes/`:
```javascript
router.post('/nuevo-endpoint', validateNuevoEndpoint, nuevoController);
```

2. **Crear validador** en `src/utils/validators.js`:
```javascript
export const validateNuevoEndpoint = [
    body('campo')
        .trim()
        .notEmpty().withMessage('El campo es requerido')
        .isLength({ min: 5 }).withMessage('Mínimo 5 caracteres'),
    handleValidationErrors
];
```

3. **Crear controlador** en `src/controllers/`:
```javascript
export const nuevoController = async (req, res) => {
    try {
        const { campo } = req.body;
        // Lógica aquí
        return sendSuccess(res, 'Éxito', resultado);
    } catch (error) {
        return sendError(res, error.message, null, 500);
    }
};
```

4. **Si requiere DB**, crear función en `src/models/`:
```javascript
export const nuevaOperacionDB = async (datos) => {
    const sql = `INSERT INTO tabla (campo) VALUES (?)`;
    const result = await query(sql, [datos.campo]);
    return result.insertId;
};
```

### Documentación con JSDoc

**Ejemplo:**
```javascript
/**
 * Autentica al usuario y genera un token JWT.
 * @param {string} email - Email del usuario.
 * @param {string} password - Contraseña en texto plano.
 * @returns {Promise<Object>} Objeto con token y datos del usuario.
 * @throws {Error} Si las credenciales son inválidas.
 */
export const login = async (email, password) => {
    // Implementación
};
```

### Clean Code

**Reglas Aplicadas:**

1. **Nombres Pronunciables:**
   - ❌ `const d = new Date()`
   - ✅ `const creationDate = new Date()`

2. **Funciones de una Sola Cosa:**
   - ❌ Función que valida, guarda y envía email
   - ✅ Separar en: `validar()`, `guardar()`, `enviarEmail()`

3. **Comentarios "Por Qué", no "Qué":**
   - ❌ `// Incrementa i en 1`
   - ✅ `// Necesitamos este offset porque la API empieza en índice 1`

4. **Evitar Código Muerto:**
   - Eliminar funciones y variables no utilizadas
   - Comentar código temporal con `// TODO:` o `// FIXME:`

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start
```

---

## 📚 Recursos Adicionales

- [Express.js Documentation](https://expressjs.com/)
- [MariaDB Node.js Connector](https://github.com/mariadb-corporation/mariadb-connector-nodejs)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [Express Validator](https://express-validator.github.io/docs/)
- [Nodemailer Documentation](https://nodemailer.com/about/)

---

## 🚀 Mejoras Futuras Recomendadas

1. **Seguridad:**
   - Agregar `helmet` para proteger cabeceras HTTP
   - Implementar rate limiting
   - Agregar CSRF protection

2. **Email:**
   - Usar Handlebars para plantillas
   - Separar plantillas HTML en archivos

3. **Base de Datos:**
   - Implementar migraciones (ej: Knex.js)
   - Agregar ORM (ej: Sequelize, TypeORM)

4. **Testing:**
   - Unit tests (Jest)
   - Integration tests
   - E2E tests

5. **Documentación:**
   - Swagger/OpenAPI para documentación de API
   - Postman collection

6. **Logging:**
   - Winston o Pino para logging estructurado
   - Logs en archivos separados por nivel

---

**Última actualización:** 2024
