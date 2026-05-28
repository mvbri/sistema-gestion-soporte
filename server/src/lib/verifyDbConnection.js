import { getConnection } from '../config/database.js';
import { getDbLabel } from './dbConfig.js';

/** Valores de plantilla en .env.example; cadena vacía es válida (MariaDB local sin contraseña). */
const PLACEHOLDER_DB_PASSWORDS = new Set(['your_password', 'changeme', 'change_me']);

function rootDbError(error) {
    return error?.cause ?? error;
}

/**
 * Verifica credenciales y conectividad antes del schema check (falla rápido, sin pool timeout).
 */
export async function verifyDbConnection() {
    const password = process.env.DB_PASSWORD ?? '';
    const user = process.env.DB_USER || 'root';
    const host = process.env.DB_HOST || 'localhost';
    const dbLabel = getDbLabel();

    if (PLACEHOLDER_DB_PASSWORDS.has(password.trim())) {
        const err = new Error(
            `DB_PASSWORD en server/.env sigue siendo el valor de ejemplo ("${password.trim()}"). ` +
                `Usa la misma contraseña que en HeidiSQL (usuario "${user}" en ${host}; déjala vacía si no tiene). ` +
                `Si usas TiDB Cloud, copia credenciales desde deploy/tidb.md.`
        );
        err.code = 'DB_CONFIG_PLACEHOLDER';
        throw err;
    }

    let conn;
    try {
        conn = await getConnection();
        await conn.query('SELECT 1');
    } catch (error) {
        const root = rootDbError(error);

        if (root?.code === 'ER_ACCESS_DENIED_ERROR') {
            const err = new Error(
                `Acceso denegado a la base de datos (${dbLabel}). ` +
                    `Revisa DB_USER y DB_PASSWORD en server/.env.`
            );
            err.code = 'ER_ACCESS_DENIED_ERROR';
            throw err;
        }
        if (root?.code === 'ECONNREFUSED' || error?.code === 'ECONNREFUSED') {
            const err = new Error(
                `No se pudo conectar a ${host}:${process.env.DB_PORT || 3306}. ` +
                    `¿Está MariaDB/MySQL en ejecución?`
            );
            err.code = 'ECONNREFUSED';
            throw err;
        }
        throw error;
    } finally {
        if (conn) conn.release();
    }
}
