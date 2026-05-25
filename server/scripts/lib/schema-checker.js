import { FORM_SCHEMA_CHECKS, getFormById } from './schema-manifest.js';

export async function fetchTableColumns(conn, tableName) {
    const rows = await conn.query(
        `SELECT COLUMN_NAME
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
         ORDER BY ORDINAL_POSITION`,
        [tableName]
    );
    return new Set(rows.map((r) => r.COLUMN_NAME));
}

export async function tableExists(conn, tableName) {
    const rows = await conn.query(
        `SELECT 1 FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
         LIMIT 1`,
        [tableName]
    );
    return rows.length > 0;
}

function checkTableSpec(tableSpec, columnSet) {
    const issues = [];
    const warnings = [];

    if (!columnSet) {
        if (tableSpec.optional) {
            warnings.push(`Tabla opcional "${tableSpec.table}" no existe`);
        } else {
            issues.push(`Falta la tabla "${tableSpec.table}"`);
        }
        return { issues, warnings, ok: tableSpec.optional === true };
    }

    for (const col of tableSpec.requiredColumns || []) {
        if (!columnSet.has(col)) {
            issues.push(`Falta columna "${col}"`);
        }
    }

    for (const col of tableSpec.deprecatedColumns || []) {
        if (columnSet.has(col)) {
            issues.push(`Columna obsoleta "${col}" aún presente (renombrar o eliminar)`);
        }
    }

    return { issues, warnings, ok: issues.length === 0 };
}

export async function checkForm(conn, form) {
    const tableResults = [];

    for (const tableSpec of form.tables) {
        const exists = await tableExists(conn, tableSpec.table);
        const columnSet = exists ? await fetchTableColumns(conn, tableSpec.table) : null;
        const { issues, warnings, ok } = checkTableSpec(tableSpec, columnSet);

        tableResults.push({
            table: tableSpec.table,
            exists,
            optional: tableSpec.optional === true,
            issues,
            warnings,
            ok,
            migrations: tableSpec.migrations || [],
        });
    }

    const ok = tableResults.every((t) => t.ok);
    return { form, tableResults, ok };
}

export async function checkAllForms(conn, filterFormId = null) {
    const forms = filterFormId
        ? [getFormById(filterFormId)].filter(Boolean)
        : FORM_SCHEMA_CHECKS;

    if (filterFormId && forms.length === 0) {
        throw new Error(`Formulario desconocido: "${filterFormId}"`);
    }

    const results = [];
    for (const form of forms) {
        results.push(await checkForm(conn, form));
    }
    return results;
}

export function printCheckReport(results, dbLabel) {
    console.log(`\nDiagnóstico de esquema — ${dbLabel}\n`);

    let totalIssues = 0;

    for (const { form, tableResults, ok } of results) {
        const status = ok ? 'OK' : 'PROBLEMAS';
        console.log(`[${status}] ${form.label} (${form.route})`);
        console.log(`       id: ${form.id}`);

        for (const t of tableResults) {
            if (t.ok && t.warnings.length === 0) {
                console.log(`       ✓ ${t.table}`);
                continue;
            }

            const prefix = t.exists ? '       ✗' : '       ✗ (tabla ausente)';
            console.log(`${prefix} ${t.table}`);
            for (const issue of t.issues) {
                console.log(`         - ${issue}`);
                totalIssues++;
            }
            for (const w of t.warnings) {
                console.log(`         ~ ${w}`);
            }
            if (t.migrations.length > 0) {
                console.log(`         migraciones: ${t.migrations.join(', ')}`);
            }
        }
        console.log('');
    }

    if (totalIssues === 0) {
        console.log('Sin desfases detectados para los formularios revisados.\n');
        return 0;
    }

    console.log(
        `${totalIssues} problema(s) de columnas/tablas. Ejecuta:\n` +
            '  node scripts/apply-pending-schema-fixes.js\n' +
            'o las migraciones indicadas en server/database/\n'
    );
    return totalIssues;
}
