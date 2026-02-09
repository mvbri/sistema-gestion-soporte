# Sistema de Gestión de Soporte Técnico e Incidencias

Aplicación web para la gestión de soporte técnico e incidencias de la Dirección de Informática de Alcaldía del Municipio Angostura del Orinoco.

## Estructura del Proyecto

```
aplicacion/
├── client/          # Frontend (React + TypeScript + Tailwind)
├── server/          # Backend (Node.js + Express + MariaDB)
└── package.json     # Scripts para desarrollo
```

## Tecnologías

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Zod (validación)
- React Hook Form

### Backend
- Node.js
- Express.js
- MariaDB
- JWT
- Nodemailer (2FA y recuperación de contraseña)
- Bcryptjs
- Express Validator

## Instalación

1. Instalar dependencias de todos los proyectos:
```bash
npm install
```

2. Configurar variables de entorno:
- Copiar `server/.env.example` a `server/.env`
- Configurar las variables necesarias (base de datos, email, JWT secret)

3. Crear la base de datos:
```bash
# Ejecutar el script SQL en server/database/schema.sql
```

4. Iniciar desarrollo:
```bash
npm run dev
```

## Fases del Proyecto

### Fase 1: Autenticación y Registro ✅
- Registro de usuarios
- Login con JWT
- Verificación en dos pasos (2FA) por email
- Recuperación de contraseña
- Roles: Administrador, Técnico, Usuario Final

## Scripts Disponibles

- `npm run dev` - Inicia frontend y backend en modo desarrollo
- `npm run dev:server` - Solo backend
- `npm run dev:client` - Solo frontend
- `npm install` - Instala todas las dependencias


