# Backend — Sistema de gestión de soporte

API Node.js + Express + MariaDB.

## Requisitos

- Node.js 18+
- MariaDB/MySQL local
- Archivo `.env` (copiar desde `.env.example`)

## Primera instalación (nueva PC)

```bash
cd server
cp .env.example .env          # editar DB_* y credenciales
npm install
npm run migrate               # aplica todos los migration_*.sql pendientes
npm run dev
```

Los scripts de migración leen los archivos en [`database/`](database/) y los ejecutan en la base indicada por **`DB_NAME`** y **`DB_HOST`** en `.env` (ej. `sistema_soporte@localhost`).

## Sincronización en equipo

El esquema de la BD se versiona con archivos SQL en `server/database/migration_*.sql`. Cada desarrollador tiene **su propia MariaDB local**, pero todos deben aplicar **los mismos archivos** del repositorio Git.

### Fuente de verdad

| Qué | Dónde |
|-----|--------|
| Cambios de esquema (qué aplicar) | Archivos `migration_*.sql` en Git |
| Qué ya se aplicó en **tu** BD | Tabla `schema_migrations` en **tu** `DB_NAME` |
| Columnas que exige el código | `INSERT` en `src/models/*.js` (check al arrancar) |

`npm run migrate` **no** baja nada de internet: lee la carpeta `server/database/` de **tu clone** y ejecuta lo pendiente en la BD del `.env`.

### Flujo diario (después de `git pull`)

```bash
cd server
npm run migrate    # solo aplica migraciones nuevas en tu BD
npm run dev        # no arranca si falta migración o columna
```

### Instalación de cero vs BD desfasada

| Situación | Comando |
|-----------|---------|
| BD vacía, primera vez | `npm run migrate` (aplica todas) |
| Ya migraste a mano en Workbench antes de `schema_migrations` | `npm run migrate:baseline` (solo registra, no ejecuta SQL) |
| Ver estado sin arrancar servidor | `npm run schema:check` |

### Errores frecuentes

**Migré en otra base (Workbench) pero la app falla**

- La app y `npm run migrate` usan **`DB_NAME` del `.env`**, no la BD seleccionada en Workbench.
- Solución: ejecutar `npm run migrate` (o alinear el esquema) en **esa** base, o cambiar `DB_NAME` si quieres usar otra.

**Un compañero tiene migraciones que yo no**

- Falta `git pull`. Tras pull: `npm run migrate`.
- Cada uno migra **lo que tiene en su disco** contra **su BD local**.

**El servidor no arranca tras pull**

- Leer el mensaje `[schema]`: indica migración pendiente o columna faltante.
- `npm run migrate` y reintentar `npm run dev`.

### Datos vs esquema

`migrate` sincroniza **estructura** (tablas, columnas). No copia tickets, usuarios de producción, etc. Los datos iniciales (roles, estados) vienen del seed en las migraciones.

## Comandos npm

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor con nodemon; verifica esquema antes de arrancar |
| `npm run start` | Servidor producción; misma verificación |
| `npm run migrate` | Aplica SQL pendiente en `DB_NAME@DB_HOST` |
| `npm run migrate:baseline` | Registra migraciones sin ejecutar SQL |
| `npm run schema:check` | Diagnóstico de migraciones + columnas |

Detalle técnico: [`scripts/README.md`](scripts/README.md).  
Orden manual de migraciones: [`database/ORDEN_MIGRACIONES.md`](database/ORDEN_MIGRACIONES.md).

## Producción (Vercel + Render + TiDB)

Plantilla: [`.env.production.example`](.env.production.example).  
Guías: [`../deploy/README.md`](../deploy/README.md), [`../deploy/vercel.md`](../deploy/vercel.md), [`../deploy/render.md`](../deploy/render.md).

```bash
npm run deploy:prepare   # migrate + schema:check
npm run deploy:start     # prepare + start (Render)
```

## Variables de entorno relevantes

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=sistema_soporte

# Solo emergencias locales: omite verificación al arrancar
# SKIP_SCHEMA_CHECK=true
```
