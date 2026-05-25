/**
 * @deprecated Usa: node scripts/apply-pending-schema-fixes.js
 */
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const dir = dirname(fileURLToPath(import.meta.url));
console.log('Redirigiendo a apply-pending-schema-fixes.js...\n');
const r = spawnSync(process.execPath, [join(dir, 'apply-pending-schema-fixes.js')], {
    stdio: 'inherit',
});
process.exit(r.status ?? 1);
