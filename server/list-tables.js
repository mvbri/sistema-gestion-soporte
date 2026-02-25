import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

async function listTables() {
    let conn;
    try {
        console.log('🔍 Conectando a MariaDB...\n');
        
        conn = await mariadb.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sistema_soporte',
            allowPublicKeyRetrieval: true,
            ssl: false
        });

        console.log(`✅ Conectado a la base de datos: ${process.env.DB_NAME || 'sistema_soporte'}\n`);

        const tables = await conn.query('SHOW TABLES');
        
        console.log(`📊 Total de tablas: ${tables.length}\n`);
        console.log('📋 Lista de tablas:');
        console.log('─'.repeat(50));
        
        const tableNameKey = Object.keys(tables[0] || {})[0] || 'Tables_in_' + (process.env.DB_NAME || 'sistema_soporte');
        
        tables.forEach((table, index) => {
            const tableName = table[tableNameKey];
            console.log(`${(index + 1).toString().padStart(3)}. ${tableName}`);
        });
        
        console.log('─'.repeat(50));
        console.log(`\n✅ Total: ${tables.length} tabla${tables.length !== 1 ? 's' : ''}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (conn) conn.end();
        process.exit();
    }
}

listTables();
