export async function tableExists(conn, tableName) {
    const rows = await conn.query(
        `SELECT 1 FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
         LIMIT 1`,
        [tableName]
    );
    return rows.length > 0;
}

export async function fetchTableColumns(conn, tableName) {
    const rows = await conn.query(
        `SELECT COLUMN_NAME
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
         ORDER BY ORDINAL_POSITION`,
        [tableName]
    );
    return new Set(rows.map((r) => r.COLUMN_NAME));
}
