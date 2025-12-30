// Script para probar la conexión a MariaDB
import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    let conn;
    try {
        console.log('🔍 Intentando conectar a MariaDB...');
        console.log('Configuración:');
        console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
        console.log(`  Port: ${process.env.DB_PORT || 3306}`);
        console.log(`  User: ${process.env.DB_USER || 'root'}`);
        console.log(`  Database: ${process.env.DB_NAME || 'sistema_soporte'}`);
        console.log(`  Password: ${process.env.DB_PASSWORD ? '***' : '(vacía)'}`);
        console.log('');

        conn = await mariadb.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'sistema_soporte',
            allowPublicKeyRetrieval: true,
            ssl: false
        });

        console.log('✅ Conexión exitosa!');
        
        // Probar una query simple
        const result = await conn.query('SELECT 1 as test, DATABASE() as current_db');
        console.log('✅ Query exitosa:', result);
        
        // Verificar que la base de datos existe
        const dbResult = await conn.query('SHOW DATABASES LIKE ?', [process.env.DB_NAME || 'sistema_soporte']);
        if (dbResult.length > 0) {
            console.log(`✅ Base de datos '${process.env.DB_NAME || 'sistema_soporte'}' existe`);
        } else {
            console.log(`⚠️  Base de datos '${process.env.DB_NAME || 'sistema_soporte'}' NO existe`);
            console.log('   Ejecuta: server/database/schema.sql');
        }

    } catch (error) {
        console.error('❌ Error de conexión:');
        console.error(`   Código: ${error.code}`);
        console.error(`   Mensaje: ${error.message}`);
        console.error('');
        console.error('🔧 Posibles soluciones:');
        console.error('   1. Verifica que MariaDB esté corriendo');
        console.error('   2. Revisa las credenciales en server/.env');
        console.error('   3. Verifica que la base de datos exista');
        console.error('   4. Revisa server/SOLUCION_ERROR_DB.md');
    } finally {
        if (conn) {
            conn.end();
            console.log('🔌 Conexión cerrada');
        }
        process.exit();
    }
}

testConnection();

