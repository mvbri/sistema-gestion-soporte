/**
 * Normaliza SQL de respaldos para motores compatibles con MySQL (p. ej. TiDB Cloud).
 * MariaDB 10.10+ emite collations uca1400 que TiDB no reconoce.
 */

const MARIADB_ONLY_COLLATIONS = [
    'utf8mb4_uca1400_ai_ci',
    'utf8mb4_uca1400_as_ci',
    'utf8mb4_uca1400_as_cs',
];

const DEFAULT_BACKUP_COLLATION = 'utf8mb4_bin';

/**
 * Collation destino para dumps y restauraciones (env: DB_BACKUP_COLLATION).
 */
export function getBackupCollation() {
    const fromEnv = process.env.DB_BACKUP_COLLATION?.trim();
    return fromEnv || DEFAULT_BACKUP_COLLATION;
}

/**
 * Reemplaza collations específicas de MariaDB por una collation compatible con TiDB.
 * @param {string} sql
 * @param {{ collation?: string }} [options]
 * @returns {string}
 */
export function normalizeSqlForTarget(sql, options = {}) {
    if (!sql || typeof sql !== 'string') {
        return sql;
    }

    const target = options.collation || getBackupCollation();
    let result = sql;

    for (const source of MARIADB_ONLY_COLLATIONS) {
        if (source === target) {
            continue;
        }
        result = result.split(source).join(target);
    }

    return result;
}

/**
 * Mensaje amigable si el motor rechaza una collation (p. ej. backup sin normalizar).
 * @param {Error} error
 * @returns {string|null}
 */
export function formatCollationRestoreError(error) {
    const msg = error?.message || String(error);
    if (!/unknown collation/i.test(msg)) {
        return null;
    }

    const quoted = msg.match(/['`]([^'`]+)['`]/i);
    const collation = quoted?.[1] || 'desconocida';
    const target = getBackupCollation();

    return (
        `Collation no soportada en TiDB ("${collation}"). ` +
        `Los respaldos generados en MariaDB local deben usar "${target}" (el servidor lo aplica al restaurar). ` +
        `Si el error continúa, descargue el .sql, reemplace "${collation}" por "${target}" o regenere el respaldo desde producción. ` +
        `Detalle técnico: ${msg}`
    );
}
