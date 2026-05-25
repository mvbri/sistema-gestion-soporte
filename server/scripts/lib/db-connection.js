import mariadb from 'mariadb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

export async function createDbConnection() {
    return mariadb.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sistema_soporte',
        multipleStatements: true,
    });
}

export function getDbLabel() {
    return `${process.env.DB_NAME || 'sistema_soporte'}@${process.env.DB_HOST || 'localhost'}`;
}
