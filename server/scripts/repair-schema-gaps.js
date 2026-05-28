/**
 * Repara huecos de esquema tras restaurar un respaldo antiguo:
 * - schema_migrations dice "todo aplicado" pero faltan tablas/columnas.
 * - Re-ejecuta migraciones concretas (CREATE IF NOT EXISTS) y las registra.
 *
 * Uso:
 *   npm run schema:repair
 */
import mariadb from 'mariadb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { evaluateSchemaStatus } from '../src/lib/startupSchemaCheck.js';
import { readMigrationSql } from '../src/lib/migrationRegistry.js';
import { getDbConnectionOptions } from '../src/lib/dbConfig.js';
import { getDbLabel } from './lib/db-connection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

/** Tabla faltante → archivo de migración que la crea */
const TABLE_TO_MIGRATION = {
    ticket_comments: 'migration_2026-02-25_22-08-00_create_ticket_comments.sql',
    ticket_history: 'migration_2026-02-25_22-09-00_create_ticket_history.sql',
    ticket_equipment: 'migration_2026-02-24_21-10-00_add_ticket_equipment.sql',
};

function stripUseDatabase(sql) {
    return sql.replace(/USE\s+[`'"]?[\w]+[`'"]?\s*;/gi, '');
}

console.log(`\nReparación de esquema — ${getDbLabel()}\n`);

const before = await evaluateSchemaStatus();
const missingTables = [
    ...new Set(
        before.missingColumns
            .filter((m) => m.reason === 'table_missing')
            .map((m) => m.table)
    ),
];

if (missingTables.length === 0 && before.ok) {
    console.log('No hay tablas faltantes detectadas. Esquema OK.\n');
    process.exit(0);
}

const migrationsToRun = [];
for (const table of missingTables) {
    const file = TABLE_TO_MIGRATION[table];
    if (file && !migrationsToRun.includes(file)) {
        migrationsToRun.push(file);
    }
}

if (migrationsToRun.length === 0) {
    console.log('Hay columnas/tablas faltantes pero no hay migración mapeada para repararlas.');
    console.log('Ejecuta: npm run schema:check');
    console.log('Luego: npm run migrate (o aplica migraciones manualmente).\n');
    process.exit(1);
}

const conn = await mariadb.createConnection(
    getDbConnectionOptions({ multipleStatements: true })
);

try {
    for (const filename of migrationsToRun) {
        const sql = stripUseDatabase(readMigrationSql(filename));
        process.stdout.write(`  ${filename} ... `);
        try {
            await conn.query(sql);
            await conn.query('INSERT IGNORE INTO schema_migrations (filename) VALUES (?)', [
                filename,
            ]);
            console.log('OK');
        } catch (err) {
            console.log('ERROR');
            console.error(`\n${err.message}\n`);
            process.exit(1);
        }
    }
} finally {
    await conn.end();
}

const after = await evaluateSchemaStatus();
if (!after.ok) {
    console.log('\nAún hay problemas de esquema. Ejecuta: npm run schema:check\n');
    process.exit(1);
}

console.log('\nReparación completada. Esquema alineado.\n');
process.exit(0);
