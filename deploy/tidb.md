# TiDB Cloud Starter (base de datos)

## Registro

1. [tidbcloud.com](https://tidbcloud.com) → Sign up (GitHub o email).
2. Spending limit = **0** (sin tarjeta para el tier free).
3. Create Resource → **Starter** → región AWS cercana (ej. `us-east-1`).

## Conexión

En el panel: Connect → MySQL → copiar host, port (`4000`), user, password.

```env
DB_HOST=gateway01.xxx.prod.aws.tidbcloud.com
DB_PORT=4000
DB_USER=xxxxx.root
DB_PASSWORD=xxxxxxxx
DB_NAME=sistema_soporte
DB_SSL=true
DB_BACKUP_COLLATION=utf8mb4_bin
```

## Migraciones

Desde `server/` con el `.env` anterior:

```bash
npm run deploy:prepare
```

Las migraciones incluyen `USE sistema_soporte;` — el nombre en `DB_NAME` debe ser exactamente `sistema_soporte` (o el que uses en TiDB al crear la BD).

Si TiDB no permite `CREATE DATABASE`, crea la BD vacía desde la consola o conecta con `DB_NAME=test` y ejecuta solo tras crear `sistema_soporte` manualmente.

## Compatibilidad

- Driver: `mariadb` (ya en el proyecto).
- SSL obligatorio: `DB_SSL=true` en [`server/src/lib/dbConfig.js`](../server/src/lib/dbConfig.js).
- Este proyecto **no** migra a PostgreSQL: las migraciones SQL son MySQL/TiDB; usar TiDB (o MariaDB local) evita reescribir esquema y modelos.

## Problemas frecuentes

| Error | Solución |
|-------|----------|
| SSL handshake | Confirmar `DB_SSL=true` |
| Access denied | Revisar usuario/contraseña del panel |
| Unknown database | Crear `sistema_soporte` en TiDB o ajustar `DB_NAME` |
| `Unknown collation: utf8mb4_uca1400_ai_ci` al restaurar respaldo | Backups viejos de MariaDB local. El API normaliza collations al generar/restaurar (`DB_BACKUP_COLLATION=utf8mb4_bin`). Tras desplegar el backend actualizado, restaurar de nuevo sin editar el `.sql`. Si persiste, regenerar respaldo desde producción (API conectado a TiDB). |
