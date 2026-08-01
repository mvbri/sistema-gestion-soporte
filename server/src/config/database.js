// Configuración de conexión a MariaDB
import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

// Pool de conexiones para mejor rendimiento
const pool = mariadb.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sistema_soporte',
    connectionLimit: 5,
    acquireTimeout: 30000,
    timeout: 30000,
    allowPublicKeyRetrieval: true,
    ssl: false
});

// Función para obtener conexión
export const getConnection = async () => {
    try {
        return await pool.getConnection();
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        throw error;
    }
};

// Función para ejecutar consultas
export const query = async (sql, params = []) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.query(sql, params);
        return result;
    } catch (error) {
        console.error('Error en consulta SQL:', error);
        throw error;
    } finally {
        if (conn) conn.release();
    }
};

export default pool;

