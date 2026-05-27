import mariadb from 'mariadb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getDbConnectionOptions, getDbLabel as formatDbLabel } from '../../src/lib/dbConfig.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

export async function createDbConnection() {
    return mariadb.createConnection(getDbConnectionOptions({ multipleStatements: true }));
}

export function getDbLabel() {
    return formatDbLabel();
}
