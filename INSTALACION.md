# Guía de Instalación - Sistema de Gestión de Soporte Técnico

## Requisitos Previos

- Node.js (v18 o superior)
- MariaDB (v10.6 o superior)
- npm o yarn

## Pasos de Instalación

### 1. Instalar Dependencias

```bash
npm run install:all
```

Este comando instalará las dependencias del proyecto raíz, del servidor y del cliente.

### 2. Configurar Base de Datos

Hay varias formas de ejecutar el script SQL. Elige la que prefieras:

#### Opción 1: Usando MySQL/MariaDB desde la línea de comandos

```bash
# Conectarse a MariaDB
mysql -u root -p

# Una vez dentro, ejecutar:
SOURCE D:/Nueva\ carpeta/Desarrollo/universidad/aplicacion/server/database/schema.sql

# O si prefieres ejecutarlo directamente desde la terminal:
mysql -u root -p < server/database/schema.sql
```

#### Opción 2: Usando HeidiSQL (Interfaz Gráfica - Recomendado)

1. Descarga e instala HeidiSQL desde: https://www.heidisql.com/
2. Conéctate a tu servidor MariaDB/MySQL
3. Crea una nueva base de datos llamada `sistema_soporte` (o déjalo que el script la cree)
4. Selecciona la base de datos
5. Ve a `Archivo` → `Ejecutar archivo SQL...`
6. Selecciona el archivo `server/database/schema.sql`
7. Haz clic en `Ejecutar`

#### Opción 3: Usando phpMyAdmin (Si tienes XAMPP/WAMP)

1. Abre phpMyAdmin (generalmente en http://localhost/phpmyadmin)
2. Ve a la pestaña `SQL`
3. Copia el contenido completo de `server/database/schema.sql`
4. Pégalo en el área de texto
5. Haz clic en `Ejecutar`

#### Opción 4: Usando DBeaver (Gratuito y multiplataforma)

1. Descarga DBeaver desde: https://dbeaver.io/
2. Conéctate a tu servidor MariaDB/MySQL
3. Clic derecho en tu conexión → `SQL Editor` → `Open SQL Script`
4. Selecciona el archivo `server/database/schema.sql`
5. Haz clic en `Execute SQL Script` (F5)

#### Opción 5: Copiar y Pegar Manualmente

1. Abre el archivo `server/database/schema.sql` en un editor de texto
2. Copia todo el contenido
3. Conéctate a tu servidor MariaDB usando cualquier cliente
4. Pega y ejecuta el contenido completo

**Nota:** Si la base de datos ya existe y quieres empezar de cero, puedes eliminarla primero:
```sql
DROP DATABASE IF EXISTS sistema_soporte;
```
Luego ejecuta el script normalmente.

### 3. Configurar Variables de Entorno

**📖 Guía detallada:** Ver `server/CONFIGURAR_ENV.md` para instrucciones paso a paso.

**Resumen rápido:**

1. Copia el archivo de ejemplo:

**Windows (PowerShell):**
```powershell
Copy-Item server\.env.example server\.env
```

**Windows (CMD):**
```cmd
copy server\.env.example server\.env
```

**Linux/Mac:**
```bash
cp server/.env.example server/.env
```

2. Edita `server/.env` con tus configuraciones:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=sistema_soporte

# JWT (cambia en producción)
JWT_SECRET=tu_secreto_super_seguro_minimo_32_caracteres
JWT_EXPIRES_IN=7d

# Servidor
PORT=5000
NODE_ENV=development

# Email (Gmail SMTP - Gratuito)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
EMAIL_FROM=noreply@alcaldia-angostura.gob.ve

# Frontend
FRONTEND_URL=http://localhost:5173
```

#### Configurar Gmail para Envío de Emails (Gratuito)

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Activa la verificación en dos pasos
3. Ve a "Contraseñas de aplicaciones": https://myaccount.google.com/apppasswords
4. Genera una contraseña de aplicación para "Correo"
5. Usa esa contraseña en `EMAIL_PASS`

### 4. Iniciar la Aplicación

#### Desarrollo (Frontend + Backend)
```bash
npm run dev
```

#### Solo Backend
```bash
npm run dev:server
```

#### Solo Frontend
```bash
npm run dev:client
```

### 5. Acceder a la Aplicación

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Estructura del Proyecto

```
aplicacion/
├── client/                 # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── contexts/       # Contextos de React
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── services/       # Servicios API
│   │   ├── styles/         # Estilos (Tailwind + módulos CSS)
│   │   ├── types/          # Tipos TypeScript
│   │   └── utils/          # Utilidades
│   └── package.json
├── server/                 # Backend Node.js + Express
│   ├── src/
│   │   ├── config/         # Configuraciones (DB, Email)
│   │   ├── controllers/    # Controladores
│   │   ├── models/         # Modelos de datos
│   │   ├── routes/         # Rutas
│   │   └── utils/           # Utilidades
│   ├── database/           # Scripts SQL
│   └── package.json
└── package.json
```

## Funcionalidades Implementadas (Fase 1)

✅ Registro de usuarios
✅ Login con JWT
✅ Verificación de email (2FA)
✅ Recuperación de contraseña
✅ Roles: Administrador, Técnico, Usuario Final
✅ Validación de formularios (Zod + Express Validator)
✅ Protección de rutas

## Próximas Fases

- Gestión de incidencias
- Sistema de tickets
- Dashboard de estadísticas
- Notificaciones en tiempo real


