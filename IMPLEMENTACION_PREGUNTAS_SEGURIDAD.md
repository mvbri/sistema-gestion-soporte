# Implementación de Preguntas de Seguridad

## Resumen
Se ha implementado un sistema de recuperación de contraseña alternativo usando preguntas de seguridad, además del método existente por email.

## Cambios Realizados

### Base de Datos
1. **Migración SQL**: `server/database/migration_security_questions.sql`
   - Agrega 4 columnas a la tabla `usuarios`:
     - `security_question_1`: Primera pregunta de seguridad
     - `security_answer_1`: Respuesta hasheada de la primera pregunta
     - `security_question_2`: Segunda pregunta de seguridad
     - `security_answer_2`: Respuesta hasheada de la segunda pregunta

### Backend

#### Modelo Usuario (`server/src/models/Usuario.js`)
- `updateSecurityQuestions()`: Actualiza las preguntas y respuestas (hashea las respuestas)
- `verifySecurityAnswers()`: Verifica que las respuestas sean correctas
- `getSecurityQuestions()`: Obtiene las preguntas de un usuario por email

#### Controlador (`server/src/controllers/authController.js`)
- `getSecurityQuestions()`: Endpoint para obtener preguntas de seguridad
- `verifySecurityAnswers()`: Verifica respuestas y genera token de recuperación
- `setSecurityQuestions()`: Configura preguntas de seguridad (requiere autenticación)

#### Rutas (`server/src/routes/authRoutes.js`)
- `POST /auth/get-security-questions`: Obtener preguntas por email
- `POST /auth/verify-security-answers`: Verificar respuestas
- `PUT /auth/security-questions`: Configurar preguntas (autenticado)

#### Validadores (`server/src/utils/validators.js`)
- `validateGetSecurityQuestions`: Valida email
- `validateVerifySecurityAnswers`: Valida email y respuestas
- `validateSetSecurityQuestions`: Valida preguntas y respuestas

### Frontend

#### Servicio (`client/src/services/authService.ts`)
- `getSecurityQuestions()`: Obtiene preguntas de seguridad
- `verifySecurityAnswers()`: Verifica respuestas y obtiene token
- `setSecurityQuestions()`: Configura preguntas de seguridad

#### Esquemas (`client/src/schemas/authSchemas.ts`)
- `securityQuestionsSchema`: Valida configuración de preguntas
- `verifySecurityAnswersSchema`: Valida respuestas

#### Páginas
- **RequestPasswordRecovery** (`client/src/pages/RequestPasswordRecovery.tsx`):
  - Permite elegir entre recuperación por email o preguntas de seguridad
  - Interfaz con dos botones para seleccionar método
  
- **VerifySecurityQuestions** (`client/src/pages/VerifySecurityQuestions.tsx`):
  - Muestra las preguntas de seguridad
  - Permite responder y verificar
  - Redirige a restablecimiento de contraseña si es exitoso

- **Profile** (`client/src/pages/Profile.tsx`):
  - Sección para configurar preguntas de seguridad
  - Formulario expandible para configurar ambas preguntas

#### Rutas (`client/src/App.tsx`)
- Agregada ruta `/verificar-preguntas-seguridad`

## Instrucciones de Instalación

### 1. Ejecutar Migración de Base de Datos
```bash
# Conectarse a MariaDB
mysql -u root -p sistema_soporte < server/database/migration_security_questions.sql
```

O ejecutar manualmente:
```sql
USE sistema_soporte;

ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS security_question_1 VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS security_answer_1 VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS security_question_2 VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS security_answer_2 VARCHAR(255) NULL;
```

### 2. Reiniciar Servidor
```bash
cd server
npm start
```

### 3. Reiniciar Cliente (si es necesario)
```bash
cd client
npm start
```

## Flujo de Uso

### Configurar Preguntas de Seguridad
1. Usuario inicia sesión
2. Va a Perfil (`/perfil`)
3. Hace clic en "Configurar Preguntas de Seguridad"
4. Completa las dos preguntas y respuestas
5. Guarda

### Recuperar Contraseña con Preguntas
1. Usuario va a `/recuperar-password`
2. Selecciona "Recuperar con Preguntas de Seguridad"
3. Ingresa su email
4. Se muestran sus preguntas de seguridad
5. Responde ambas preguntas
6. Si son correctas, se genera un token y redirige a `/restablecer-password`
7. Usuario establece nueva contraseña

## Seguridad

- Las respuestas se almacenan hasheadas usando bcryptjs (mismo método que contraseñas)
- Las respuestas se normalizan (lowercase y trim) antes de comparar
- Se requiere autenticación para configurar preguntas
- Las preguntas deben tener al menos 10 caracteres
- Las respuestas deben tener al menos 3 caracteres

## Notas

- Los usuarios pueden configurar preguntas de seguridad desde su perfil
- Si un usuario no tiene preguntas configuradas, solo puede usar el método de email
- El sistema valida que ambas respuestas sean correctas antes de generar el token
