# Scripts de base de datos

Documentación general del backend y **sincronización en equipo**: [`../README.md`](../README.md).

## Flujo recomendado

```bash
cd server
npm run migrate          # muestra BD: sistema_soporte@localhost, aplica .sql pendientes
npm run dev              # arranca solo si migraciones + columnas (modelos) coinciden
```

Si la BD **ya tenía** todas las migraciones aplicadas a mano (antes de `schema_migrations`):

```bash
npm run migrate:baseline   # registra archivos sin re-ejecutar SQL
npm run dev
```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run migrate` | Ejecuta migraciones pendientes en `server/database/` |
| `npm run migrate:baseline` | Marca todas las migraciones como aplicadas sin ejecutar SQL |
| `npm run schema:check` | Diagnóstico sin arrancar el servidor |

Todos muestran la base objetivo como `DB_NAME@DB_HOST` (desde `.env`).

## Dónde se leen los archivos SQL

[`../src/lib/migrationRegistry.js`](../src/lib/migrationRegistry.js) lista y lee `server/database/migration_*.sql`.  
[`migrate.js`](migrate.js) los ejecuta; [`startupSchemaCheck.js`](../src/lib/startupSchemaCheck.js) compara nombres con `schema_migrations`.

## Cómo se valida el esquema (automático al arrancar)

1. **Migraciones:** archivos `migration_*.sql` en disco vs tabla `schema_migrations`.
2. **Columnas:** `INSERT INTO` en `server/src/models/*.js` vs `information_schema`.

Si hay desfase, el servidor **no arranca** y muestra qué migración o columna falta.

Emergencia local (no recomendado): `SKIP_SCHEMA_CHECK=true` en `.env`.

## Scripts legacy

- `apply-pending-schema-fixes.js` — parches puntuales; preferir `npm run migrate`
- `check-material-requests-schema.js` — redirige a `check-db-schema.js`
