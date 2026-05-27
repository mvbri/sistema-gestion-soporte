import { query } from '../config/database.js';
import { listMigrationFiles } from './migrationRegistry.js';
import { loadExpectedColumnsFromModels } from './schemaFromModels.js';

async function tableExists(tableName) {
    const rows = await query(
        `SELECT 1 FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
         LIMIT 1`,
        [tableName]
    );
    return rows.length > 0;
}

async function getAppliedMigrationFilenames() {
    try {
        const exists = await tableExists('schema_migrations');
        if (!exists) {
            return new Set();
        }
        const rows = await query('SELECT filename FROM schema_migrations');
        return new Set(rows.map((r) => r.filename));
    } catch {
        return new Set();
    }
}

async function fetchDbColumnsByTable(tableNames) {
    if (tableNames.length === 0) {
        return new Map();
    }

    const placeholders = tableNames.map(() => '?').join(', ');
    const rows = await query(
        `SELECT TABLE_NAME, COLUMN_NAME
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME IN (${placeholders})`,
        tableNames
    );

    const result = new Map();
    for (const row of rows) {
        if (!result.has(row.TABLE_NAME)) {
            result.set(row.TABLE_NAME, new Set());
        }
        result.get(row.TABLE_NAME).add(row.COLUMN_NAME);
    }
    return result;
}

/**
 * @returns {{ ok: boolean, pendingMigrations: string[], missingColumns: { table: string, column: string }[], schemaMigrationsTableMissing: boolean }}
 */
export async function evaluateSchemaStatus() {
    const allMigrations = listMigrationFiles();
    const applied = await getAppliedMigrationFilenames();
    const pendingMigrations = allMigrations.filter((f) => !applied.has(f));
    const schemaMigrationsTableMissing = !(await tableExists('schema_migrations'));

    const expectedByTable = loadExpectedColumnsFromModels();
    const tableNames = [...expectedByTable.keys()];
    const dbColumns = await fetchDbColumnsByTable(tableNames);

    const missingColumns = [];

    for (const [table, requiredCols] of expectedByTable) {
        const dbCols = dbColumns.get(table);
        if (!dbCols) {
            for (const column of requiredCols) {
                missingColumns.push({ table, column, reason: 'table_missing' });
            }
            continue;
        }
        for (const column of requiredCols) {
            if (!dbCols.has(column)) {
                missingColumns.push({ table, column, reason: 'column_missing' });
            }
        }
    }

    const ok =
        pendingMigrations.length === 0 &&
        missingColumns.length === 0 &&
        !schemaMigrationsTableMissing;

    return {
        ok,
        pendingMigrations,
        missingColumns,
        schemaMigrationsTableMissing,
        expectedTables: tableNames.length,
    };
}

function formatSchemaError(status) {
    const dbLabel = `${process.env.DB_NAME || 'sistema_soporte'}@${process.env.DB_HOST || 'localhost'}`;
    const lines = [`[schema] Base de datos desactualizada (${dbLabel}):\n`];

    if (status.schemaMigrationsTableMissing) {
        lines.push('  - Falta la tabla schema_migrations (nunca se ejecutó migrate).');
    }

    for (const filename of status.pendingMigrations) {
        lines.push(`  - Migración pendiente: ${filename}`);
    }

    for (const { table, column, reason } of status.missingColumns) {
        if (reason === 'table_missing') {
            lines.push(`  - Falta la tabla: ${table} (columna esperada: ${column})`);
        } else {
            lines.push(`  - Columna faltante: ${table}.${column}`);
        }
    }

    lines.push('\nEjecuta: cd server && npm run migrate');
    lines.push('Si la BD ya estaba migrada a mano: npm run migrate -- --baseline');
    lines.push('Emergencia (no recomendado): SKIP_SCHEMA_CHECK=true en .env\n');

    return lines.join('\n');
}

export async function assertSchemaReady() {
    if (process.env.SKIP_SCHEMA_CHECK === 'true') {
        console.warn('[schema] SKIP_SCHEMA_CHECK=true — verificación de esquema omitida.');
        return evaluateSchemaStatus();
    }

    const status = await evaluateSchemaStatus();

    if (!status.ok) {
        console.error(formatSchemaError(status));
        process.exit(1);
    }

    return status;
}
