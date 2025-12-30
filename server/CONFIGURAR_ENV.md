# Guía para Configurar Variables de Entorno (.env)

## Paso 1: Crear el archivo .env

### Opción A: Copiar desde .env.example (Recomendado)

**En Windows (PowerShell):**
```powershell
Copy-Item server\.env.example server\.env
```

**En Windows (CMD):**
```cmd
copy server\.env.example server\.env
```

**En Linux/Mac:**
```bash
cp server/.env.example server/.env
```

### Opción B: Crear manualmente

1. Ve a la carpeta `server/`
2. Crea un nuevo archivo llamado `.env` (sin extensión)
3. Copia el contenido de `.env.example` y pégalo en `.env`

## Paso 2: Editar el archivo .env

Abre el archivo `server/.env` con cualquier editor de texto (Notepad++, VS Code, etc.) y configura los siguientes valores:

### 1. Configuración de Base de Datos

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña_de_mariadb
DB_NAME=sistema_soporte
```

**Explicación:**
- `DB_HOST`: Generalmente `localhost` si MariaDB está en tu máquina
- `DB_PORT`: Puerto de MariaDB (por defecto 3306)
- `DB_USER`: Usuario de MariaDB (generalmente `root`)
- `DB_PASSWORD`: **Tu contraseña de MariaDB** (¡IMPORTANTE! Cambia esto)
- `DB_NAME`: Nombre de la base de datos (`sistema_soporte`)

### 2. Configuración JWT (Seguridad)

```env
JWT_SECRET=tu_secreto_super_seguro_minimo_32_caracteres_aqui
JWT_EXPIRES_IN=7d
```

**Explicación:**
- `JWT_SECRET`: **DEBE ser una cadena larga y aleatoria** (mínimo 32 caracteres)
  - Puedes generar uno aquí: https://randomkeygen.com/
  - O usar: `openssl rand -base64 32` (en terminal)
  - **NUNCA compartas este secreto**
- `JWT_EXPIRES_IN`: Tiempo de expiración del token (7d = 7 días)

**Ejemplo de JWT_SECRET seguro:**
```
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c8f5f167f44f4964e6c998dee827110c
```

### 3. Configuración del Servidor

```env
PORT=5000
NODE_ENV=development
```

**Explicación:**
- `PORT`: Puerto donde correrá el servidor backend (5000 por defecto)
- `NODE_ENV`: `development` para desarrollo, `production` para producción

### 4. Configuración de Email (Gmail SMTP - Gratuito)

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
EMAIL_FROM=noreply@alcaldia-angostura.gob.ve
```

**Explicación:**
- `EMAIL_HOST`: Servidor SMTP de Gmail
- `EMAIL_PORT`: Puerto SMTP (587 para TLS)
- `EMAIL_USER`: Tu dirección de Gmail completa
- `EMAIL_PASS`: **Contraseña de aplicación de Gmail** (NO tu contraseña normal)
- `EMAIL_FROM`: Email que aparecerá como remitente

#### Cómo obtener la Contraseña de Aplicación de Gmail:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Activa la **Verificación en dos pasos** (si no la tienes)
3. Ve a **Contraseñas de aplicaciones**: https://myaccount.google.com/apppasswords
4. Selecciona:
   - **Aplicación**: Correo
   - **Dispositivo**: Otro (nombre personalizado) - escribe "Sistema Soporte"
5. Haz clic en **Generar**
6. **Copia la contraseña de 16 caracteres** que aparece
7. Pégala en `EMAIL_PASS` en tu archivo `.env`

**Ejemplo:**
```
EMAIL_USER=miemail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

### 5. URL del Frontend

```env
FRONTEND_URL=http://localhost:5173
```

**Explicación:**
- URL donde corre tu aplicación frontend (Vite usa 5173 por defecto)
- En producción, cambia esto a tu dominio real

## Ejemplo Completo de .env

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=MiPassword123
DB_NAME=sistema_soporte

# JWT Configuration
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c8f5f167f44f4964e6c998dee827110c
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (Gmail SMTP - Free)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=miemail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM=noreply@alcaldia-angostura.gob.ve

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Verificar que Funciona

Después de configurar el `.env`, inicia el servidor:

```bash
cd server
npm run dev
```

Si todo está bien, deberías ver:
```
Servidor corriendo en puerto 5000
Servidor de email listo para enviar mensajes
```

Si hay errores, revisa:
- Que el archivo se llame exactamente `.env` (no `.env.txt`)
- Que no haya espacios alrededor del `=` en las variables
- Que las contraseñas estén correctas
- Que MariaDB esté corriendo

## Importante

- **NUNCA** subas el archivo `.env` a Git (ya está en `.gitignore`)
- **NUNCA** compartas tu `JWT_SECRET` o contraseñas
- En producción, usa variables de entorno del servidor, no archivos `.env`

