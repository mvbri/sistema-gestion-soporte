/**
 * Diagnóstico BD ↔ código (migraciones registradas + columnas INSERT en modelos).
 *
 * Uso:
 *   node scripts/check-db-schema.js
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { evaluateSchemaStatus } from '../src/lib/startupSchemaCheck.js';
import { getExpectedColumnsByTable } from '../src/lib/schemaFromModels.js';
import { getDbLabel } from './lib/db-connection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const dbLabel = getDbLabel();
console.log(`\nDiagnóstico de esquema — ${dbLabel}`);
console.log(`(configuración: DB_NAME y DB_HOST en server/.env)\n`);

const status = await evaluateSchemaStatus();

if (status.schemaMigrationsTableMissing) {
    console.log('[PROBLEMA] Tabla schema_migrations no existe.');
}

if (status.pendingMigrations.length > 0) {
    console.log(`[PROBLEMA] ${status.pendingMigrations.length} migración(es) pendiente(s):`);
    for (const f of status.pendingMigrations) {
        console.log(`  - ${f}`);
    }
    console.log('');
} else if (!status.schemaMigrationsTableMissing) {
    console.log('[OK] Todas las migraciones del repositorio están registradas.\n');
}

const expected = getExpectedColumnsByTable();
console.log('Columnas esperadas (desde INSERT en server/src/models):');
for (const [table, cols] of Object.entries(expected).sort()) {
    console.log(`  ${table}: ${cols.join(', ')}`);
}
console.log('');

if (status.missingColumns.length > 0) {
    console.log(`[PROBLEMA] ${status.missingColumns.length} columna(s)/tabla(s) faltante(s):`);
    for (const { table, column, reason } of status.missingColumns) {
        if (reason === 'table_missing') {
            console.log(`  - Tabla ausente: ${table}`);
        } else {
            console.log(`  - ${table}.${column}`);
        }
    }
    console.log('\nEjecuta: cd server && npm run migrate');
    console.log('BD ya migrada a mano: npm run migrate -- --baseline\n');
    process.exit(1);
}

if (!status.ok) {
    console.log('Ejecuta: cd server && npm run migrate\n');
    process.exit(1);
}

console.log('Esquema alineado con modelos y migraciones registradas.\n');
process.exit(0);
