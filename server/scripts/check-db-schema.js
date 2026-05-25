/**
 * Diagnóstico BD ↔ formularios del sistema.
 *
 * Uso:
 *   node scripts/check-db-schema.js              # todos los formularios
 *   node scripts/check-db-schema.js create-ticket # un formulario
 *   node scripts/check-db-schema.js --list       # ids disponibles
 */
import { createDbConnection, getDbLabel } from './lib/db-connection.js';
import { checkAllForms, printCheckReport } from './lib/schema-checker.js';
import { listFormIds } from './lib/schema-manifest.js';

const arg = process.argv[2];

if (arg === '--list' || arg === '-h' || arg === '--help') {
    console.log('\nFormularios disponibles:\n');
    for (const id of listFormIds()) {
        console.log(`  ${id}`);
    }
    console.log('\nEjemplo: node scripts/check-db-schema.js create-material-request\n');
    process.exit(0);
}

const conn = await createDbConnection();

try {
    const results = await checkAllForms(conn, arg || null);
    const issueCount = printCheckReport(results, getDbLabel());
    process.exit(issueCount > 0 ? 1 : 0);
} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
} finally {
    await conn.end();
}
