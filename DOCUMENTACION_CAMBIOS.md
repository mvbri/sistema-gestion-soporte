# Documentación Completa de Cambios - Sistema de Autenticación

## 📋 Resumen General de Cambios

Este documento detalla todos los cambios realizados en el sistema de autenticación y registro para la aplicación web de gestión de soporte técnico. El sistema incluye:

- **Autenticación JWT** con persistencia de sesión
- **Registro de usuarios** con validación completa
- **Verificación de email** (2FA) con reenvío
- **Recuperación de contraseña** con tokens temporales
- **Diseño corporativo** con paleta de colores personalizada
- **Fuente Inter** optimizada desde Google Fonts
- **Gestión de tokens** en base de datos
- **Validación** tanto en frontend como backend

---

## 📁 Lista de Archivos por Utilidad

### Frontend (Client)

#### **Páginas (Pages)**
- `client/src/pages/Login.tsx` - Página de inicio de sesión con formulario y validación
- `client/src/pages/Register.tsx` - Página de registro de nuevos usuarios (nombre de archivo en inglés, URL: `/registro`)
- `client/src/pages/VerifyEmail.tsx` - Página para verificar email mediante token (URL: `/verificar-email`)
- `client/src/pages/RequestVerification.tsx` - Página para solicitar reenvío de verificación (URL: `/solicitar-verificacion`)
- `client/src/pages/EmailAlreadyVerified.tsx` - Página informativa cuando el email ya está verificado (URL: `/email-ya-verificado`)
- `client/src/pages/RequestPasswordRecovery.tsx` - Página para solicitar recuperación de contraseña (URL: `/recuperar-password`)
- `client/src/pages/ResetPassword.tsx` - Página para restablecer contraseña con token (URL: `/restablecer-password`)
- `client/src/pages/Dashboard.tsx` - Página principal después del login

**Nota importante**: Los nombres de archivos están en inglés para mantener consistencia en el código, pero las rutas URL visibles al usuario están en español.

#### **Contextos y Hooks**
- `client/src/contexts/AuthContext.tsx` - Provider de autenticación con estado global
- `client/src/contexts/authContext.ts` - Definición del contexto y tipos TypeScript
- `client/src/hooks/useAuth.ts` - Hook personalizado para acceder al contexto de autenticación

#### **Servicios**
- `client/src/services/authService.ts` - Servicio para todas las llamadas API de autenticación

#### **Utilidades**
- `client/src/utils/api.ts` - Configuración de Axios con interceptores para tokens y errores
- `client/src/utils/responseHandler.js` - (Backend) Utilidad para respuestas consistentes de API

#### **Validación**
- `client/src/schemas/authSchemas.ts` - Esquemas Zod para validación de formularios

#### **Tipos TypeScript**
- `client/src/types/index.ts` - Interfaces y tipos TypeScript para toda la aplicación

#### **Estilos**
- `client/src/styles/index.css` - Estilos globales con Tailwind CSS
- `client/src/styles/modules/forms.module.css` - Estilos CSS modules para formularios (errores, contenedores, spinners)

#### **Configuración**
- `client/tailwind.config.js` - Configuración de Tailwind CSS con paleta de colores
- `client/index.html` - HTML principal con carga de Google Fonts
- `client/src/vite-env.d.ts` - Declaraciones TypeScript para módulos CSS

#### **Componentes**
- `client/src/components/ProtectedRoute.tsx` - Componente para proteger rutas que requieren autenticación
- `client/src/App.tsx` - Componente principal con rutas y configuración de React Router

### Backend (Server)

#### **Controladores**
- `server/src/controllers/authController.js` - Lógica de negocio para autenticación, registro, verificación y recuperación

#### **Modelos**
- `server/src/models/Usuario.js` - Modelo para operaciones de base de datos relacionadas con usuarios
- `server/src/models/Token.js` - Modelo para gestión de tokens de verificación y recuperación

#### **Rutas**
- `server/src/routes/authRoutes.js` - Definición de rutas API para autenticación

#### **Validación Backend**
- `server/src/utils/validators.js` - Middleware de validación usando express-validator

#### **Utilidades**
- `server/src/utils/jwt.js` - Utilidades para generar y verificar tokens JWT
- `server/src/utils/responseHandler.js` - Utilidad para respuestas consistentes de API

#### **Configuración**
- `server/src/config/database.js` - Configuración de conexión a MariaDB
- `server/src/config/email.js` - Configuración de Nodemailer para envío de emails
- `server/src/index.js` - Punto de entrada del servidor Express

#### **Base de Datos**
- `server/database/schema.sql` - Esquema SQL para crear tablas (roles, usuarios, tokens_verificacion)

#### **Scripts de Prueba**
- `server/test-connection.js` - Script para probar conexión a base de datos
- `server/test-email.js` - Script para probar envío de emails
- `server/diagnostico-verificacion.js` - Script para diagnosticar tokens de verificación

---

## 🎓 Tecnologías, Lógica y Patrones Necesarios

### Frontend

#### **React y TypeScript**
- **React Hooks**: `useState`, `useEffect`, `useContext`, `useNavigate`, `useSearchParams`
- **React Router**: Navegación y rutas protegidas
- **TypeScript**: Tipos, interfaces, genéricos
- **React Hook Form**: Manejo de formularios con validación
- **Zod**: Validación de esquemas TypeScript-first

#### **Estilos**
- **Tailwind CSS**: Utilidades de diseño responsive
- **CSS Modules**: Estilos encapsulados por componente
- **Google Fonts**: Carga optimizada de fuentes web

#### **Estado y Contexto**
- **Context API**: Estado global de autenticación
- **Custom Hooks**: Abstracción de lógica reutilizable
- **LocalStorage/SessionStorage**: Persistencia de tokens

#### **HTTP y API**
- **Axios**: Cliente HTTP con interceptores
- **JWT**: Tokens de autenticación
- **Async/Await**: Manejo asíncrono de peticiones

#### **Notificaciones**
- **React Toastify**: Notificaciones toast para feedback al usuario

### Backend

#### **Node.js y Express**
- **Express.js**: Framework web para APIs REST
- **Middleware**: Validación, autenticación, manejo de errores
- **Rutas**: Organización modular de endpoints

#### **Base de Datos**
- **MariaDB/MySQL**: Base de datos relacional SQL
- **Connection Pooling**: Gestión eficiente de conexiones
- **SQL Queries**: Consultas parametrizadas para seguridad

#### **Autenticación y Seguridad**
- **JWT (jsonwebtoken)**: Tokens de autenticación firmados
- **Bcryptjs**: Hashing de contraseñas
- **Express Validator**: Validación de datos de entrada

#### **Email**
- **Nodemailer**: Envío de emails SMTP
- **Gmail SMTP**: Configuración para envío gratuito

#### **Patrones**
- **MVC**: Separación de controladores, modelos y vistas
- **Repository Pattern**: Abstracción de acceso a datos
- **Middleware Pattern**: Interceptores de requests
- **Error Handling**: Manejo centralizado de errores

---

## 📝 Explicación Detallada de Cambios por Archivo

### Frontend - Páginas

#### `client/src/pages/Login.tsx`

**Cambios realizados:**
1. **Integración de React Hook Form**: Implementación de formulario controlado con validación mediante Zod
2. **Estado de "Mantenerme conectado"**: Agregado estado `rememberMe` para persistencia de sesión
3. **Manejo de errores mejorado**: Redirección automática a página de verificación si el email no está verificado
4. **Toast notifications**: Reemplazo de mensajes estáticos por notificaciones toast con `react-toastify`
5. **Diseño corporativo**: Aplicación de estilos CSS modules corporativos
6. **Toggle de contraseña**: Botón para mostrar/ocultar contraseña
7. **Integración con AuthContext**: Uso del hook `useAuth` para login

**Lógica implementada:**
- El formulario valida email y contraseña antes de enviar
- Si el login falla por email no verificado, redirige a `/solicitar-verificacion` con el email en el estado
- El checkbox "Mantenerme conectado" controla si el token se guarda en `localStorage` (persistente) o `sessionStorage` (temporal)
- Los errores se muestran mediante toast notifications

#### `client/src/pages/Register.tsx`

**Cambios realizados:**
1. **Formulario completo**: Campos para nombre completo, email, contraseña, teléfono (opcional) y departamento
2. **Validación en tiempo real**: Validación de todos los campos con mensajes de error específicos
3. **Función de limpieza de datos**: `formatRegisterData()` que limpia y formatea campos antes de enviar
   - Elimina espacios al inicio y final (trim) de todos los campos string
   - Convierte campos opcionales vacíos a `null`
   - Mantiene campos requeridos como strings
4. **Indicador de fortaleza de contraseña**: Mensaje con requisitos de contraseña
5. **Toggle de contraseña**: Botón para mostrar/ocultar contraseña
6. **Redirección post-registro**: Después del registro exitoso, redirige a login con mensaje de verificación
7. **Manejo de errores mejorado**: Muestra errores de validación específicos del backend en toast notifications
8. **Tipado TypeScript**: Uso de `unknown` en lugar de `any` para mejor seguridad de tipos

**Lógica implementada:**
- Validación de email, contraseña segura (min 8 caracteres, mayúscula, minúscula, número)
- Limpieza automática de datos antes de enviar al backend (trim y conversión de vacíos a null)
- Después del registro, se envía email de verificación automáticamente
- El usuario debe verificar su email antes de poder iniciar sesión

#### `client/src/pages/VerifyEmail.tsx`

**Cambios realizados:**
1. **Verificación automática**: Al cargar la página, verifica el token automáticamente
2. **Manejo de estados**: Estados de loading, success y error
3. **Redirección inteligente**: Si el email ya está verificado, redirige a página especial
4. **Toast notifications**: Feedback visual del proceso con `react-toastify`

**Lógica implementada:**
- Lee el token de la URL (`?token=...`)
- Llama al endpoint `/auth/verify-email`
- Si el email ya estaba verificado, redirige a `/email-ya-verificado`
- Si es exitoso, redirige a login después de 2 segundos

#### `client/src/pages/RequestVerification.tsx`

**Cambios realizados:**
1. **Página nueva**: Creada para manejar solicitudes de reenvío de verificación
2. **Timer de cooldown**: Implementación de temporizador de 60 segundos antes de permitir reenvío
3. **Prellenado de email**: Si viene desde login, prellena el campo de email desde el estado de navegación
4. **Formato de tiempo**: Función para mostrar tiempo en formato MM:SS

**Lógica implementada:**
- Previene spam de solicitudes con timer de 60 segundos
- Permite al usuario ingresar su email si no viene prellenado
- Envía email de verificación al backend usando `/auth/resend-verification`

#### `client/src/pages/EmailAlreadyVerified.tsx`

**Cambios realizados:**
1. **Página informativa**: Nueva página para cuando el email ya está verificado
2. **Navegación**: Enlaces a login y aplicación principal
3. **Diseño simple**: Mensaje claro con icono de éxito

**Lógica implementada:**
- Página estática informativa
- Proporciona opciones de navegación al usuario

#### `client/src/pages/RequestPasswordRecovery.tsx`

**Cambios realizados:**
1. **Formulario simple**: Solo campo de email para solicitar recuperación
2. **Validación de email**: Validación del formato de email con Zod
3. **Toast notifications**: Feedback del proceso con `react-toastify`

**Lógica implementada:**
- Envía email al backend usando `/auth/request-password-recovery`
- El backend genera token y envía email con enlace
- No revela si el email existe por seguridad

#### `client/src/pages/ResetPassword.tsx`

**Cambios realizados:**
1. **Lectura de token**: Lee el token de la URL usando `useSearchParams`
2. **Validación de token**: Verifica que el token exista antes de mostrar formulario
3. **Formulario de contraseña**: Dos campos (nueva contraseña y confirmación) con toggles para mostrar/ocultar
4. **Validación de coincidencia**: La confirmación debe coincidir con la nueva contraseña
5. **Redirección post-éxito**: Redirige a login después de restablecer
6. **Toast notifications**: Feedback visual del proceso

**Lógica implementada:**
- Extrae token de query params (`?token=...`)
- Si no hay token, redirige a `/recuperar-password`
- Valida que ambas contraseñas coincidan usando Zod
- Envía token y nueva contraseña al backend usando `/auth/reset-password`
- El backend valida el token y actualiza la contraseña

### Frontend - Componentes

#### `client/src/App.tsx`

**Cambios realizados:**
1. **Integración de ToastContainer**: Configuración global de `react-toastify` para notificaciones
2. **Rutas en español**: URLs visibles al usuario están en español (`/registro`, `/verificar-email`, etc.)
3. **Componentes en inglés**: Imports de componentes con nombres en inglés pero mapeados a rutas en español
4. **Rutas protegidas**: Implementación de `ProtectedRoute` para el dashboard

**Lógica implementada:**
- `ToastContainer` configurado globalmente con posición top-right y duración de 5 segundos
- Rutas URL en español para mejor experiencia del usuario
- Imports de componentes mantienen nombres en inglés para consistencia del código
- Todas las rutas configuradas con React Router v6

#### `client/src/components/ProtectedRoute.tsx`

**Cambios realizados:**
1. **Protección de rutas**: Componente que verifica autenticación antes de renderizar contenido
2. **Estado de loading**: Muestra spinner mientras verifica autenticación
3. **Redirección automática**: Redirige a login si no está autenticado

**Lógica implementada:**
- Usa hook `useAuth()` para verificar estado de autenticación
- Muestra spinner durante la verificación inicial
- Redirige a `/login` si el usuario no está autenticado

### Frontend - Contextos y Hooks

#### `client/src/contexts/AuthContext.tsx`

**Cambios realizados:**
1. **Provider de autenticación**: Context provider para estado global de autenticación
2. **Inicialización automática**: Al cargar, verifica si hay token y obtiene usuario actual
3. **Funciones de autenticación**: Login, registro y logout
4. **Estado de loading**: Indica cuando se está verificando autenticación inicial

**Lógica implementada:**
- Al montar, busca token en localStorage o sessionStorage
- Si hay token, obtiene información del usuario actual del backend
- Si el token es inválido, limpia el estado
- Función `login()` acepta parámetro `rememberMe` para controlar persistencia de sesión
- Proporciona funciones para login, registro y logout a todos los componentes hijos

#### `client/src/contexts/authContext.ts`

**Cambios realizados:**
1. **Separación de definición**: Definición del contexto separada del provider
2. **Tipos TypeScript**: Interface `AuthContextType` con todas las propiedades y métodos

**Lógica implementada:**
- Define el tipo del contexto para TypeScript
- Crea el contexto React con `createContext`
- Permite tipado fuerte en toda la aplicación

#### `client/src/hooks/useAuth.ts`

**Cambios realizados:**
1. **Hook personalizado**: Hook para acceder fácilmente al contexto
2. **Validación de uso**: Verifica que se use dentro del AuthProvider
3. **Separación de Fast Refresh**: Separado del provider para cumplir con Fast Refresh

**Lógica implementada:**
- Wrapper alrededor de `useContext(AuthContext)`
- Lanza error si se usa fuera del provider
- Proporciona acceso tipado al contexto

### Frontend - Servicios

#### `client/src/services/authService.ts`

**Cambios realizados:**
1. **Servicio centralizado**: Todas las llamadas API de autenticación en un solo lugar
2. **Persistencia de tokens**: Guarda tokens en localStorage o sessionStorage según `rememberMe`
3. **Métodos completos**: Register, login, verificación, recuperación, restablecimiento
4. **Gestión de storage**: Funciones para obtener y limpiar tokens y usuarios
5. **Rutas API en inglés**: Todas las rutas del backend usan nombres en inglés (`/register`, `/verify-email`, etc.)
6. **Funciones renombradas**: `verifyEmail()`, `resendVerification()`, `requestPasswordRecovery()`, `resetPassword()`

**Lógica implementada:**
- `login()`: Acepta parámetro `rememberMe`, guarda token en localStorage si es true, sino en sessionStorage
- `logout()`: Limpia ambos storages por seguridad
- `getToken()`: Busca en ambos storages (localStorage primero, luego sessionStorage)
- `getUser()`: Busca usuario en ambos storages
- Todas las funciones retornan `Promise<ApiResponse>` para manejo consistente
- Interface `RegisterData` permite `phone` y `department` como `string | null`

### Frontend - Utilidades

#### `client/src/utils/api.ts`

**Cambios realizados:**
1. **Configuración de Axios**: Cliente HTTP configurado con baseURL
2. **Interceptor de requests**: Agrega token JWT automáticamente a todas las peticiones
3. **Interceptor de responses**: Maneja errores 401 y limpia tokens
4. **Búsqueda en ambos storages**: Busca token en localStorage y sessionStorage
5. **Proxy de Vite**: Usa `/api` como fallback si no existe `VITE_API_URL`, aprovechando el proxy configurado en `vite.config.ts`

**Lógica implementada:**
- Interceptor de request: Busca token en ambos storages (localStorage primero) y lo agrega al header `Authorization` con formato `Bearer <token>`
- Interceptor de response: Si recibe 401, limpia tokens y datos de usuario de ambos storages y redirige a login (excepto si ya está en `/login` o `/registro`)
- Configuración base: URL de API desde variable de entorno `VITE_API_URL` o `/api` por defecto
- El proxy de Vite redirige automáticamente `/api` a `http://localhost:5000` en desarrollo

### Frontend - Validación

#### `client/src/schemas/authSchemas.ts`

**Cambios realizados:**
1. **Esquemas Zod**: Validación TypeScript-first para todos los formularios
2. **Validación de contraseña**: Reglas específicas (min 8 caracteres, mayúscula, minúscula, número)
3. **Validación de email**: Formato de email válido
4. **Confirmación de contraseña**: Validación de que ambas contraseñas coincidan

**Lógica implementada:**
- `loginSchema`: Email y contraseña requeridos
- `registroSchema`: Todos los campos con validaciones específicas, departamento requerido
- `restablecerPasswordSchema`: Nueva contraseña y confirmación que deben coincidir

### Frontend - Tipos

#### `client/src/types/index.ts`

**Cambios realizados:**
1. **Interfaces TypeScript**: Definición de todos los tipos de datos
2. **User interface**: Estructura completa del usuario
3. **ApiResponse genérico**: Tipo genérico para respuestas de API
4. **AuthResponse**: Tipo específico para respuestas de autenticación

**Lógica implementada:**
- Tipos estrictos para toda la aplicación
- Genéricos para reutilización (`ApiResponse<T>`)
- Roles definidos como union type

### Frontend - Estilos

#### `client/src/styles/index.css`

**Cambios realizados:**
1. **Tailwind base**: Importación de Tailwind CSS
2. **Fuente Inter**: Configuración de fuente principal con fallbacks
3. **Font smoothing**: Optimización de renderizado de fuentes
4. **Componentes reutilizables**: Clases para botones, inputs, cards

**Lógica implementada:**
- `@layer base`: Estilos base aplicados al body
- `@layer components`: Componentes reutilizables con Tailwind
- Font smoothing para mejor renderizado en diferentes sistemas operativos

#### `client/src/styles/modules/forms.module.css`

**Cambios realizados:**
1. **Estilos para formularios**: CSS modules específicos para formularios
2. **Componentes específicos**: Estilos para contenedores (`.formContainer`), grupos (`.formGroup`), inputs con error (`.inputError`)
3. **Estados de error**: Estilos para inputs con errores de validación usando `outline` (no `ring-color` que es solo de Tailwind)
4. **Mensajes de estado**: Estilos para mensajes de éxito (`.successMessage`) y error (`.errorAlert`)
5. **Loading spinner**: Animación CSS para spinners de carga

**Lógica implementada:**
- Estilos encapsulados usando CSS modules
- Reutilizables mediante importación de módulos
- Compatible con Tailwind CSS
- Usa propiedades CSS estándar (no utilidades de Tailwind como `ring-color`)

#### `client/tailwind.config.js`

**Cambios realizados:**
1. **Extensión de colores**: Agregada paleta completa de colores a Tailwind
2. **Fuente Inter**: Configurada como fuente sans por defecto
3. **Fallbacks**: Fuentes del sistema como fallback

**Lógica implementada:**
- Permite usar colores como `bg-primary-600`, `text-error-500`, etc.
- Fuente Inter disponible globalmente
- Configuración centralizada

#### `client/index.html`

**Cambios realizados:**
1. **Google Fonts**: Carga optimizada de Inter con preconnect
2. **Pesos específicos**: Solo carga los pesos necesarios (400, 500, 600, 700)
3. **Display swap**: Evita bloqueo de renderizado

**Lógica implementada:**
- `preconnect` para mejorar rendimiento
- Solo pesos necesarios para reducir tamaño de descarga
- `display=swap` para mostrar texto inmediatamente con fallback

### Backend - Controladores

#### `server/src/controllers/authController.js`

**Cambios realizados:**
1. **Registro completo**: Validación, hash de contraseña, creación de usuario y token de verificación
2. **Login mejorado**: Validación de credenciales, verificación de email, generación de JWT
3. **Verificación de email**: Validación de token, actualización de estado, manejo de ya verificado
4. **Reenvío de verificación**: Eliminación de tokens anteriores, creación de nuevo token
5. **Recuperación de contraseña**: Generación de token temporal, envío de email
6. **Restablecimiento**: Validación de token, actualización de contraseña
7. **Mensajes de error específicos**: Diferentes mensajes para diferentes errores

**Lógica implementada:**
- **register()**: 
  - Valida que el email no exista
  - Crea usuario con contraseña hasheada
  - Genera token de verificación
  - Envía email de verificación
  - Si hay error después de crear el usuario/token pero antes de enviar el correo, limpia los recursos creados
  - Si el correo se envía exitosamente, no se eliminan recursos aunque haya error después
- **login()**: Verifica credenciales, valida que email esté verificado, genera JWT con información del usuario
  - Retorna mensajes específicos para usuario no encontrado, contraseña incorrecta, cuenta desactivada, email no verificado
- **verifyEmail()**: Valida token, verifica que no esté usado/expirado, actualiza estado de usuario
  - Retorna flag `already_verified: true` si el email ya estaba verificado
- **resendVerification()**: Elimina tokens anteriores, crea nuevo token, envía email
- **requestRecovery()**: Genera token de 1 hora, envía email con enlace
- **resetPassword()**: Valida token, actualiza contraseña con hash nuevo, marca token como usado
- **getCurrentUser()**: Obtiene información del usuario actual desde el token JWT

### Backend - Modelos

#### `server/src/models/Usuario.js`

**Cambios realizados:**
1. **Métodos CRUD**: Create, findByEmail, findById, updatePassword, verifyEmail
2. **Hash de contraseñas**: Uso de bcryptjs para hashing seguro
3. **Verificación de contraseña**: Método para comparar contraseña con hash
4. **Conversión de BigInt**: Conversión explícita de IDs de BigInt a Number

**Lógica implementada:**
- `create()`: Inserta usuario con contraseña hasheada, retorna usuario sin contraseña
  - Convierte `insertId` y `role_id` de BigInt a Number explícitamente
- `findByEmail()`: Busca usuario con join a tabla de roles para obtener nombre del rol
- `findById()`: Busca usuario por ID con join a roles
- `verifyPassword()`: Compara contraseña plana con hash usando bcrypt
- `verifyEmail()`: Actualiza estado de verificación de email a TRUE
- `updatePassword()`: Actualiza contraseña con nuevo hash
- `emailExists()`: Verifica si un email ya está registrado
- `delete()`: Elimina un usuario de la base de datos (usado para limpieza en caso de errores)
- Conversión explícita de BigInt a Number previene errores de serialización JSON

#### `server/src/models/Token.js`

**Cambios realizados:**
1. **Gestión de tokens**: Creación, búsqueda, marcado como usado, eliminación
2. **Validación de tokens**: Verificación de expiración y uso
3. **Tipos de tokens**: email_verification, password_recovery
4. **Limpieza de tokens**: Eliminación de tokens expirados y por usuario

**Lógica implementada:**
- `create()`: Crea token con expiración configurable (default 24 horas)
- `findValid()`: Busca token válido (no usado, no expirado) con join a usuarios
  - Selecciona campos explícitamente para evitar duplicados (`user_id` aparece en ambas tablas)
  - Convierte `id` y `user_id` de BigInt a Number
  - Retorna información del usuario junto con el token
- `markAsUsed()`: Marca token como usado para prevenir reutilización
- `deleteExpired()`: Elimina tokens expirados de la base de datos
- `deleteByUser()`: Elimina tokens anteriores del mismo tipo para un usuario (usado para limpieza)

### Backend - Rutas

#### `server/src/routes/authRoutes.js`

**Cambios realizados:**
1. **Rutas completas**: Todas las rutas de autenticación en un solo archivo
2. **Middleware de validación**: Validación aplicada antes de controladores
3. **Middleware de autenticación**: Protección de ruta de usuario actual

**Lógica implementada:**
- POST `/api/auth/register`: Registro de nuevos usuarios (ruta en inglés)
- POST `/api/auth/login`: Inicio de sesión
- GET `/api/auth/verify-email`: Verificación de email con token en query (ruta en inglés)
- POST `/api/auth/resend-verification`: Reenvío de email de verificación (ruta en inglés)
- POST `/api/auth/request-password-recovery`: Solicitud de recuperación (ruta en inglés)
- POST `/api/auth/reset-password`: Restablecimiento de contraseña (ruta en inglés)
- GET `/api/auth/current-user`: Obtener usuario actual (protegida, ruta en inglés)

**Nota importante**: Las rutas del backend están en inglés para mantener consistencia en la API, mientras que las URLs del frontend visibles al usuario están en español.

### Backend - Validación

#### `server/src/utils/validators.js`

**Cambios realizados:**
1. **Validación con express-validator**: Middleware de validación para todas las rutas
2. **Validación de email**: Formato y existencia
3. **Validación de contraseña**: Fortaleza y coincidencia
4. **Validación de campos requeridos**: Todos los campos necesarios

**Lógica implementada:**
- `validateRegistro`: Valida todos los campos de registro con manejo correcto de campos opcionales
  - Campos opcionales (`phone`, `department`) usan `optional({ checkFalsy: true })` para ignorar strings vacíos
  - Validación personalizada para `phone` que solo valida si el campo tiene contenido
- `validateLogin`: Valida email y contraseña
- `validateRecuperacionPassword`: Valida email (usado para recuperación y reenvío de verificación)
- `validateRestablecerPassword`: Valida token y nueva contraseña
- Retorna errores específicos en formato estructurado

### Backend - Utilidades

#### `server/src/utils/jwt.js`

**Cambios realizados:**
1. **Generación de JWT**: Función para crear tokens firmados
2. **Verificación de JWT**: Middleware para verificar y decodificar tokens
3. **Payload personalizado**: Incluye id, email y role del usuario

**Lógica implementada:**
- `generarToken()`: Crea JWT con expiración de 24 horas
- `authenticate`: Middleware que verifica token en header Authorization
- Extrae información del usuario del token para usar en controladores

#### `server/src/utils/responseHandler.js`

**Cambios realizados:**
1. **Respuestas consistentes**: Formato estándar para todas las respuestas API
2. **Manejo de BigInt**: Conversión automática de BigInt a Number en JSON
3. **Funciones helper**: sendSuccess, sendError para facilitar uso

**Lógica implementada:**
- `convertBigIntToNumber()`: Función recursiva que convierte todos los valores BigInt a Number antes de serializar JSON
  - Maneja objetos, arrays y valores primitivos
  - Previene errores de serialización JSON con BigInt
- `sendResponse()`: Función base para todas las respuestas que aplica conversión de BigInt automáticamente
- `sendSuccess()`: Wrapper para respuestas exitosas (status 200 por defecto)
- `sendError()`: Wrapper para respuestas de error con código de estado (400 por defecto)

### Backend - Configuración

#### `server/src/config/database.js`

**Cambios realizados:**
1. **Connection pooling**: Pool de conexiones para eficiencia
2. **Configuración de autenticación**: allowPublicKeyRetrieval y SSL
3. **Variables de entorno**: Configuración desde .env

**Lógica implementada:**
- Pool de conexiones reutilizables
- Configuración para evitar errores de autenticación MariaDB
- Timeout y límites de conexión configurables

#### `server/src/config/email.js`

**Cambios realizados:**
1. **Configuración Nodemailer**: Transporter configurado para Gmail SMTP
2. **Templates de email**: HTML formateado para verificación y recuperación
3. **URLs correctas**: Enlaces apuntando a rutas correctas del frontend
4. **Logging**: Logs detallados para debugging

**Lógica implementada:**
- `sendVerificationEmail()`: Envía email con enlace de verificación apuntando a `/verificar-email?token=...`
- `sendPasswordRecoveryEmail()`: Envía email con enlace de restablecimiento apuntando a `/restablecer-password?token=...`
- URLs construidas desde `FRONTEND_URL` en `.env`
- Manejo de errores con logging detallado
- Templates HTML formateados para mejor presentación en clientes de email

### Base de Datos

#### `server/database/schema.sql`

**Cambios realizados:**
1. **Tabla roles**: Roles del sistema (admin, technician, end_user)
2. **Tabla usuarios**: Información completa de usuarios con foreign key a roles
3. **Tabla tokens_verificacion**: Gestión de tokens temporales
4. **Índices**: Índices para búsquedas rápidas

**Lógica implementada:**
- `roles`: ID, nombre, descripción
- `usuarios`: Información personal, credenciales, estado de verificación, foreign key a roles
- `tokens_verificacion`: Token, tipo, expiración, estado de uso, foreign key a usuarios
- Índices en email (usuarios) y token (tokens_verificacion) para performance

---

## 🔧 Configuración Necesaria

### Variables de Entorno (`.env`)

**Backend (`server/.env`):**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=1234567
DB_NAME=sistema_soporte
JWT_SECRET=tu_secreto_jwt_min_32_caracteres
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
EMAIL_FROM=tu_email@gmail.com
FRONTEND_URL=http://localhost:5173
```

**Frontend (`client/.env`):**
```
VITE_API_URL=http://localhost:5000/api
```

**Nota**: El archivo `.env` es opcional en desarrollo. Si no existe, se usa `/api` como fallback y el proxy de Vite en `vite.config.ts` redirige automáticamente a `http://localhost:5000`.

### Instalación de Dependencias

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### Base de Datos

1. Crear base de datos MariaDB/MySQL
2. Ejecutar `server/database/schema.sql`
3. Configurar credenciales en `.env`

---

## 🚀 Flujos Completos

### Flujo de Registro
1. Usuario completa formulario → Validación frontend (Zod)
2. POST `/api/auth/register` → Validación backend (express-validator)
3. Hash de contraseña → Creación de usuario en BD
4. Generación de token de verificación → Guardado en BD
5. Envío de email → Usuario recibe enlace
6. Usuario hace clic → Verificación de token
7. Email verificado → Usuario puede hacer login

### Flujo de Login
1. Usuario ingresa credenciales → Validación frontend
2. POST `/api/auth/login` → Validación backend
3. Verificación de contraseña → Comparación con hash
4. Verificación de email → Debe estar verificado
5. Generación de JWT → Token firmado con información del usuario
6. Guardado de token → localStorage (si rememberMe) o sessionStorage
7. Redirección a dashboard → Usuario autenticado

### Flujo de Recuperación de Contraseña
1. Usuario solicita recuperación → Ingresa email
2. POST `/api/auth/request-password-recovery` → Validación de email
3. Generación de token temporal → 1 hora de expiración
4. Envío de email → Enlace con token
5. Usuario hace clic → Redirección a `/restablecer-password?token=...`
6. Usuario ingresa nueva contraseña → Validación frontend y backend
7. POST `/api/auth/reset-password` → Validación de token
8. Actualización de contraseña → Nuevo hash guardado
9. Token marcado como usado → No puede reutilizarse
10. Redirección a login → Usuario puede iniciar sesión

---

## 📊 Estructura de Respuestas API

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {
    // Datos específicos
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "message": "Mensaje de error",
  "errors": [
    {
      "msg": "Error específico",
      "param": "campo"
    }
  ]
}
```

---

## 🔒 Seguridad Implementada

1. **Contraseñas hasheadas**: Bcrypt con salt rounds 10
2. **Tokens JWT firmados**: Secret key seguro
3. **Validación en ambos lados**: Frontend y backend
4. **Tokens temporales**: Expiración configurable
5. **Tokens de un solo uso**: Marcados como usados después de uso
6. **SQL parametrizado**: Prevención de inyección SQL
7. **CORS configurado**: Control de orígenes permitidos
8. **Headers de seguridad**: Configuración Express segura

---

## 📈 Mejoras Futuras Sugeridas

1. **Rate limiting**: Prevenir abuso de endpoints
2. **Refresh tokens**: Renovación automática de tokens
3. **2FA con TOTP**: Autenticación de dos factores con apps
4. **Logs de auditoría**: Registro de acciones de usuarios
5. **Recuperación con preguntas**: Método alternativo de recuperación
6. **Sesiones múltiples**: Gestión de dispositivos activos
7. **Notificaciones de seguridad**: Alertas de login desde nuevos dispositivos

---

## 📚 Recursos y Referencias

- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/
- **JWT**: https://jwt.io/
- **Bcrypt**: https://www.npmjs.com/package/bcryptjs
- **Express Validator**: https://express-validator.github.io/docs/
- **Nodemailer**: https://nodemailer.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Inter Font**: https://fonts.google.com/specimen/Inter

---

---

## 📌 Convenciones de Nombres

### Archivos y Código Interno
- **Nombres en inglés**: Todos los archivos, funciones, variables y constantes internas están en inglés
  - Ejemplos: `Register.tsx`, `VerifyEmail.tsx`, `authService.ts`, `formatRegisterData()`
- **Razón**: Mantener consistencia en el código, facilitar colaboración internacional, seguir estándares de la industria

### URLs y Rutas Visibles al Usuario
- **Rutas URL en español**: Las rutas visibles en el navegador están en español
  - Ejemplos: `/registro`, `/verificar-email`, `/solicitar-verificacion`
- **Razón**: Mejor experiencia para usuarios de habla hispana

### Rutas de API (Backend)
- **Rutas API en inglés**: Todas las rutas del backend están en inglés
  - Ejemplos: `/api/auth/register`, `/api/auth/verify-email`, `/api/auth/reset-password`
- **Razón**: Mantener consistencia en la API, facilitar integración con otros servicios

---

## 🔧 Correcciones y Mejoras Recientes

### Corrección de Errores BigInt
- **Problema**: MariaDB retorna `BigInt` para campos AUTO_INCREMENT, causando errores de serialización JSON
- **Solución**: Conversión explícita de `BigInt` a `Number` en modelos y función recursiva en `responseHandler.js`
- **Archivos afectados**: `Usuario.js`, `Token.js`, `responseHandler.js`

### Corrección de Campo Duplicado en Token.findValid()
- **Problema**: SQL query usaba `t.*` junto con `u.id as user_id`, causando campo duplicado
- **Solución**: Selección explícita de campos en lugar de `t.*`
- **Archivo afectado**: `Token.js`

### Mejora en Limpieza de Datos del Formulario
- **Problema**: Campos opcionales se enviaban como strings vacíos
- **Solución**: Función `formatRegisterData()` que hace trim y convierte vacíos a `null`
- **Archivo afectado**: `Register.tsx`

### Mejora en Validación de Campos Opcionales
- **Problema**: Validación fallaba con strings vacíos en campos opcionales
- **Solución**: Uso de `optional({ checkFalsy: true })` y validación personalizada
- **Archivo afectado**: `validators.js`

### Mejora en Flujo de Registro
- **Problema**: Se enviaba correo incluso si había errores después de crear el usuario
- **Solución**: Solo enviar correo si todo el proceso es exitoso, limpiar recursos si falla antes del envío
- **Archivo afectado**: `authController.js`

### Corrección de Propiedad CSS
- **Problema**: Uso de `ring-color` (propiedad de Tailwind, no CSS estándar)
- **Solución**: Reemplazo por `outline` y `outline-offset` (CSS estándar)
- **Archivo afectado**: `forms.module.css`

---

**Última actualización**: Diciembre 2025
**Versión del sistema**: 1.0.0

