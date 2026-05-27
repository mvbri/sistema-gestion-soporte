/**
 * Aplica migraciones pendientes y las registra en schema_migrations.
 *
 * Uso:
 *   node scripts/migrate.js              # ejecutar SQL pendientes
 *   node scripts/migrate.js --baseline   # marcar todas como aplicadas sin ejecutar (BD ya migrada a mano)
 */
import mariadb from 'mariadb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
    listMigrationFiles,
    readMigrationSql,
    ENSURE_MIGRATIONS_TABLE_SQL,
} from '../src/lib/migrationRegistry.js';
import { getDbConnectionOptions } from '../src/lib/dbConfig.js';
import { getDbLabel } from './lib/db-connection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const isBaseline = process.argv.includes('--baseline');

console.log(`Base de datos: ${getDbLabel()}\n`);

const conn = await mariadb.createConnection(
    getDbConnectionOptions({ multipleStatements: true })
);

async function ensureMigrationsTable() {
    await conn.query(ENSURE_MIGRATIONS_TABLE_SQL);
}

async function getAppliedFilenames() {
    const rows = await conn.query('SELECT filename FROM schema_migrations ORDER BY filename');
    return new Set(rows.map((r) => r.filename));
}

async function markApplied(filename) {
    await conn.query('INSERT IGNORE INTO schema_migrations (filename) VALUES (?)', [filename]);
}

try {
    await ensureMigrationsTable();
    const files = listMigrationFiles();
    const applied = await getAppliedFilenames();
    const pending = files.filter((f) => !applied.has(f));

    if (files.length === 0) {
        console.log('No hay archivos migration_*.sql en server/database/');
        process.exit(0);
    }

    if (isBaseline) {
        let marked = 0;
        for (const filename of pending) {
            await markApplied(filename);
            marked++;
        }
        console.log(`Baseline: ${marked} migración(es) registrada(s) sin ejecutar SQL.`);
        console.log(`Total registradas: ${files.length}`);
        process.exit(0);
    }

    if (pending.length === 0) {
        console.log('No hay migraciones pendientes.');
        process.exit(0);
    }

    console.log(`Aplicando ${pending.length} migración(es) pendiente(s)...\n`);

    for (const filename of pending) {
        const sql = readMigrationSql(filename);
        process.stdout.write(`  ${filename} ... `);
        try {
            await conn.query(sql);
            await markApplied(filename);
            console.log('OK');
        } catch (err) {
            console.log('ERROR');
            console.error(`\nFalló ${filename}: ${err.message}`);
            process.exit(1);
        }
    }

    console.log('\nMigraciones completadas.');
} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
} finally {
    await conn.end();
}
