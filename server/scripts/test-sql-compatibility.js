/**
 * Verifica que normalizeSqlForTarget elimina collations MariaDB de un dump de ejemplo.
 * Uso: node scripts/test-sql-compatibility.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeSqlForTarget } from '../src/utils/sqlCompatibility.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const samplePath = path.join(__dirname, '../backups/backup_2026-04-30_04-10-00.sql');

if (!fs.existsSync(samplePath)) {
    console.error('No se encontró backup de ejemplo:', samplePath);
    process.exit(1);
}

const raw = fs.readFileSync(samplePath, 'utf8');
const normalized = normalizeSqlForTarget(raw);

const mariaPatterns = ['utf8mb4_uca1400_ai_ci', 'utf8mb4_uca1400_as_ci', 'utf8mb4_uca1400_as_cs'];
const remaining = mariaPatterns.filter((p) => normalized.includes(p));

if (remaining.length > 0) {
    console.error('FAIL: siguen presentes:', remaining.join(', '));
    process.exit(1);
}

if (!normalized.includes('utf8mb4_bin')) {
    console.error('FAIL: no se encontró utf8mb4_bin tras normalizar');
    process.exit(1);
}

const beforeCount = (raw.match(/utf8mb4_uca1400_ai_ci/g) || []).length;
const afterCount = (normalized.match(/utf8mb4_bin/g) || []).length;

console.log('OK: sqlCompatibility');
console.log(`  uca1400_ai_ci reemplazados: ${beforeCount}`);
console.log(`  utf8mb4_bin en salida: ${afterCount}`);
