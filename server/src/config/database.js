// Configuración de conexión a MariaDB
import mariadb from 'mariadb';
import dotenv from 'dotenv';
import { getDbPoolOptions } from '../lib/dbConfig.js';

dotenv.config();

const pool = mariadb.createPool(getDbPoolOptions());

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

