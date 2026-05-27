/**
 * @deprecated Usa: node scripts/check-db-schema.js
 */
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const dir = dirname(fileURLToPath(import.meta.url));
const r = spawnSync(process.execPath, [join(dir, 'check-db-schema.js')], {
    stdio: 'inherit',
});
process.exit(r.status ?? 1);
