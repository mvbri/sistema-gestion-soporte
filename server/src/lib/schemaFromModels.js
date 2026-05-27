import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = path.join(__dirname, '..', 'models');

const INSERT_PATTERN =
    /INSERT\s+INTO\s+`?([a-zA-Z_][a-zA-Z0-9_]*)`?\s*\(([\s\S]*?)\)\s*VALUES/gi;

function parseColumnList(columnListRaw) {
    return columnListRaw
        .split(',')
        .map((part) => part.trim().replace(/^`|`$/g, ''))
        .filter((name) => name.length > 0 && !/^\?+$/.test(name));
}

/**
 * Extrae columnas de INSERT INTO desde archivos de modelos.
 * @returns {Map<string, Set<string>>} tabla -> columnas usadas en INSERT
 */
export function extractInsertColumnsFromSource(source, sourceLabel = '') {
    const tableColumns = new Map();

    let match;
    while ((match = INSERT_PATTERN.exec(source)) !== null) {
        const table = match[1];
        const columns = parseColumnList(match[2]);
        if (columns.length === 0) continue;

        if (!tableColumns.has(table)) {
            tableColumns.set(table, new Set());
        }
        const set = tableColumns.get(table);
        for (const col of columns) {
            set.add(col);
        }
    }

    return tableColumns;
}

export function loadExpectedColumnsFromModels() {
    const merged = new Map();

    if (!fs.existsSync(MODELS_DIR)) {
        return merged;
    }

    const files = fs.readdirSync(MODELS_DIR).filter((f) => f.endsWith('.js'));

    for (const file of files) {
        const filePath = path.join(MODELS_DIR, file);
        const source = fs.readFileSync(filePath, 'utf8');
        const fromFile = extractInsertColumnsFromSource(source, file);

        for (const [table, columns] of fromFile) {
            if (!merged.has(table)) {
                merged.set(table, new Set());
            }
            for (const col of columns) {
                merged.get(table).add(col);
            }
        }
    }

    return merged;
}

export function getExpectedColumnsByTable() {
    const map = loadExpectedColumnsFromModels();
    const result = {};
    for (const [table, cols] of map) {
        result[table] = [...cols].sort();
    }
    return result;
}
