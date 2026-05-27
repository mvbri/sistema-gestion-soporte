import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATABASE_DIR = path.join(__dirname, '..', '..', 'database');

function getRecommendedOrderFromDoc() {
    try {
        const docPath = path.join(DATABASE_DIR, 'ORDEN_MIGRACIONES.md');
        if (!fs.existsSync(docPath)) return null;
        const content = fs.readFileSync(docPath, 'utf8');
        const matches = content.match(/migration_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}_[a-z0-9_]+\.sql/g);
        if (!matches || matches.length === 0) return null;
        // preserve first occurrence order
        const seen = new Set();
        const ordered = [];
        for (const m of matches) {
            if (!seen.has(m)) {
                seen.add(m);
                ordered.push(m);
            }
        }
        return ordered;
    } catch {
        return null;
    }
}

export function listMigrationFiles() {
    if (!fs.existsSync(DATABASE_DIR)) {
        return [];
    }
    const all = fs
        .readdirSync(DATABASE_DIR)
        .filter((name) => name.startsWith('migration_') && name.endsWith('.sql'))
        .sort();

    const recommended = getRecommendedOrderFromDoc();
    if (!recommended) return all;

    // When ORDEN_MIGRACIONES.md exists, treat it as source-of-truth ordering and
    // only run migrations explicitly listed there. This allows us to supersede
    // older migrations without editing them.
    const set = new Set(all);
    return recommended.filter((f) => set.has(f));
}

export function readMigrationSql(filename) {
    return fs.readFileSync(path.join(DATABASE_DIR, filename), 'utf8');
}

export const ENSURE_MIGRATIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_schema_migrations_filename (filename)
)`;
