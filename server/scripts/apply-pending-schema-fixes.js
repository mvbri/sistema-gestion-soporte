/**
 * Aplica correcciones automáticas para desfases de esquema conocidos
 * (columnas renombradas, columnas nuevas en tablas existentes).
 *
 * No crea tablas enteras; si falta una tabla, ejecuta la migración .sql indicada
 * por check-db-schema.js.
 *
 * Uso: node scripts/apply-pending-schema-fixes.js
 */
import { createDbConnection } from './lib/db-connection.js';
import { applyAllKnownFixes } from './lib/schema-fixes.js';

const conn = await createDbConnection();

try {
    await applyAllKnownFixes(conn);
} catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
} finally {
    await conn.end();
}
