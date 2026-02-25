import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { backupsDirPath } from '../config/backup.js';

dotenv.config();

/**
 * Genera un respaldo completo de la base de datos usando mysqldump
 */
export const generateBackup = async (req, res) => {
    let backupFilePath = null;

    try {
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = process.env.DB_PORT || 3306;
        const dbUser = process.env.DB_USER || 'root';
        const dbPassword = process.env.DB_PASSWORD || '';
        const dbName = process.env.DB_NAME || 'sistema_soporte';

        const timestamp = new Date()
            .toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .substring(0, 19);
        
        const backupFileName = `backup_${timestamp}.sql`;
        backupFilePath = path.join(backupsDirPath, backupFileName);

        const mysqldumpArgs = [
            `-h${dbHost}`,
            `-P${dbPort}`,
            `-u${dbUser}`,
            `--single-transaction`,
            `--routines`,
            `--triggers`,
            `--events`,
            `--add-drop-table`,
            `--lock-tables=false`,
            `--complete-insert`,
            `--extended-insert=false`,
            `--no-tablespaces`,
            dbName
        ];

        if (dbPassword) {
            mysqldumpArgs.push(`-p${dbPassword}`);
        }

        await new Promise((resolve, reject) => {
            const mysqldump = spawn('mysqldump', mysqldumpArgs);
            const writeStream = fs.createWriteStream(backupFilePath);

            mysqldump.stdout.pipe(writeStream);
            
            let errorOutput = '';
            mysqldump.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            mysqldump.on('close', (code) => {
                writeStream.end();
                if (code !== 0) {
                    if (fs.existsSync(backupFilePath)) {
                        fs.unlinkSync(backupFilePath);
                    }
                    reject(new Error(`mysqldump falló con código ${code}: ${errorOutput}`));
                } else {
                    resolve();
                }
            });

            mysqldump.on('error', (error) => {
                writeStream.end();
                if (fs.existsSync(backupFilePath)) {
                    fs.unlinkSync(backupFilePath);
                }
                reject(error);
            });
        });

        if (!fs.existsSync(backupFilePath)) {
            throw new Error('El archivo de respaldo no se generó correctamente');
        }

        const stats = fs.statSync(backupFilePath);
        if (stats.size === 0) {
            fs.unlinkSync(backupFilePath);
            throw new Error('El respaldo generado está vacío');
        }

        res.setHeader('Content-Type', 'application/sql');
        res.setHeader('Content-Disposition', `attachment; filename="${backupFileName}"`);
        
        const fileStream = fs.createReadStream(backupFilePath);
        fileStream.pipe(res);

        fileStream.on('error', (error) => {
            console.error('Error al enviar archivo:', error);
            if (!res.headersSent) {
                sendError(res, 'Error al enviar el archivo de respaldo', null, 500);
            }
        });

    } catch (error) {
        console.error('Error al generar respaldo:', error);
        
        if (backupFilePath && fs.existsSync(backupFilePath)) {
            try {
                fs.unlinkSync(backupFilePath);
            } catch (unlinkError) {
                console.error('Error al eliminar archivo temporal:', unlinkError);
            }
        }

        if (error.message.includes('mysqldump')) {
            return sendError(res, 'mysqldump no está disponible en el sistema. Verifica que MariaDB esté instalado correctamente.', null, 500);
        }

        if (error.code === 'ETIMEDOUT' || error.signal === 'SIGTERM') {
            return sendError(res, 'La operación de respaldo excedió el tiempo límite', null, 500);
        }

        sendError(res, 'Error al generar el respaldo de la base de datos', null, 500);
    }
};

/**
 * Restaura la base de datos desde un archivo SQL subido
 */
export const restoreBackup = async (req, res) => {
    let tempFilePath = null;

    try {
        if (!req.file) {
            return sendError(res, 'No se proporcionó ningún archivo de respaldo', null, 400);
        }

        tempFilePath = req.file.path;
        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = process.env.DB_PORT || 3306;
        const dbUser = process.env.DB_USER || 'root';
        const dbPassword = process.env.DB_PASSWORD || '';
        const dbName = process.env.DB_NAME || 'sistema_soporte';

        if (!fs.existsSync(tempFilePath)) {
            return sendError(res, 'El archivo de respaldo no se encontró', null, 400);
        }

        const stats = fs.statSync(tempFilePath);
        if (stats.size === 0) {
            fs.unlinkSync(tempFilePath);
            return sendError(res, 'El archivo de respaldo está vacío', null, 400);
        }

        const mysqlArgs = [
            `-h${dbHost}`,
            `-P${dbPort}`,
            `-u${dbUser}`,
            dbName
        ];

        if (dbPassword) {
            mysqlArgs.push(`-p${dbPassword}`);
        }

        await new Promise((resolve, reject) => {
            const mysql = spawn('mysql', mysqlArgs, {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            const readStream = fs.createReadStream(tempFilePath);

            readStream.pipe(mysql.stdin);

            let errorOutput = '';
            mysql.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            mysql.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`mysql falló con código ${code}: ${errorOutput}`));
                } else {
                    resolve();
                }
            });

            mysql.on('error', (error) => {
                reject(error);
            });
        });

        fs.unlinkSync(tempFilePath);

        sendSuccess(res, 'Base de datos restaurada exitosamente', {
            filename: req.file.originalname,
            size: stats.size
        });

    } catch (error) {
        console.error('Error al restaurar respaldo:', error);

        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (unlinkError) {
                console.error('Error al eliminar archivo temporal:', unlinkError);
            }
        }

        if (error.message.includes('mysql')) {
            return sendError(res, 'mysql no está disponible en el sistema. Verifica que MariaDB esté instalado correctamente.', null, 500);
        }

        if (error.code === 'ETIMEDOUT' || error.signal === 'SIGTERM') {
            return sendError(res, 'La operación de restauración excedió el tiempo límite', null, 500);
        }

        if (error.message.includes('syntax error') || error.message.includes('SQL syntax')) {
            return sendError(res, 'El archivo SQL contiene errores de sintaxis o no es válido', null, 400);
        }

        sendError(res, 'Error al restaurar la base de datos', null, 500);
    }
};



/**
 * Lista todos los archivos de respaldo disponibles con paginación, búsqueda y ordenamiento
 */
export const listBackups = async (req, res) => {
    try {
        const search = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const orderBy = req.query.orderBy || 'created_at';
        const orderDirection = req.query.orderDirection || 'DESC';

        if (!fs.existsSync(backupsDirPath)) {
            return sendSuccess(res, 'Lista de respaldos obtenida exitosamente', {
                backups: [],
                pagination: {
                    page: 1,
                    limit: limit,
                    total: 0,
                    totalPages: 0
                }
            });
        }

        const files = fs.readdirSync(backupsDirPath);
        let backupFiles = files
            .filter(file => {
                const isSql = file.toLowerCase().endsWith('.sql');
                const isBackup = file.startsWith('backup_');
                return isSql && isBackup;
            })
            .map(file => {
                const filePath = path.join(backupsDirPath, file);
                const stats = fs.statSync(filePath);
                return {
                    filename: file,
                    size: stats.size,
                    created_at: stats.birthtime.toISOString(),
                    modified_at: stats.mtime.toISOString()
                };
            });

        if (search) {
            const searchLower = search.toLowerCase();
            backupFiles = backupFiles.filter(backup => 
                backup.filename.toLowerCase().includes(searchLower)
            );
        }

        const total = backupFiles.length;

        const sortField = orderBy === 'filename' ? 'filename' : 
                         orderBy === 'size' ? 'size' : 'created_at';
        
        backupFiles.sort((a, b) => {
            let comparison = 0;
            
            if (sortField === 'filename') {
                comparison = a.filename.localeCompare(b.filename);
            } else if (sortField === 'size') {
                comparison = a.size - b.size;
            } else {
                comparison = new Date(a.created_at) - new Date(b.created_at);
            }
            
            return orderDirection === 'ASC' ? comparison : -comparison;
        });

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedBackups = backupFiles.slice(startIndex, endIndex);

        sendSuccess(res, 'Lista de respaldos obtenida exitosamente', {
            backups: paginatedBackups,
            pagination: {
                page: page,
                limit: limit,
                total: total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error al listar respaldos:', error);
        sendError(res, 'Error al listar los respaldos', null, 500);
    }
};

/**
 * Restaura la base de datos desde un archivo de respaldo existente
 */
export const restoreBackupFromFile = async (req, res) => {
    let backupFilePath = null;

    try {
        const { filename } = req.body;

        if (!filename) {
            return sendError(res, 'El nombre del archivo es requerido', null, 400);
        }

        backupFilePath = path.join(backupsDirPath, filename);

        if (!fs.existsSync(backupFilePath)) {
            return sendError(res, 'El archivo de respaldo no existe', null, 404);
        }

        const stats = fs.statSync(backupFilePath);
        if (stats.size === 0) {
            return sendError(res, 'El archivo de respaldo está vacío', null, 400);
        }

        const dbHost = process.env.DB_HOST || 'localhost';
        const dbPort = process.env.DB_PORT || 3306;
        const dbUser = process.env.DB_USER || 'root';
        const dbPassword = process.env.DB_PASSWORD || '';
        const dbName = process.env.DB_NAME || 'sistema_soporte';

        const mysqlArgs = [
            `-h${dbHost}`,
            `-P${dbPort}`,
            `-u${dbUser}`,
            dbName
        ];

        if (dbPassword) {
            mysqlArgs.push(`-p${dbPassword}`);
        }

        await new Promise((resolve, reject) => {
            const mysql = spawn('mysql', mysqlArgs, {
                stdio: ['pipe', 'pipe', 'pipe']
            });
            const readStream = fs.createReadStream(backupFilePath);

            readStream.pipe(mysql.stdin);

            let errorOutput = '';
            mysql.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            mysql.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`mysql falló con código ${code}: ${errorOutput}`));
                } else {
                    resolve();
                }
            });

            mysql.on('error', (error) => {
                reject(error);
            });
        });

        sendSuccess(res, 'Base de datos restaurada exitosamente', {
            filename: filename,
            size: stats.size
        });

    } catch (error) {
        console.error('Error al restaurar respaldo:', error);

        if (error.message.includes('mysql')) {
            return sendError(res, 'mysql no está disponible en el sistema. Verifica que MariaDB esté instalado correctamente.', null, 500);
        }

        if (error.code === 'ETIMEDOUT' || error.signal === 'SIGTERM') {
            return sendError(res, 'La operación de restauración excedió el tiempo límite', null, 500);
        }

        if (error.message.includes('syntax error') || error.message.includes('SQL syntax')) {
            return sendError(res, 'El archivo SQL contiene errores de sintaxis o no es válido', null, 400);
        }

        sendError(res, 'Error al restaurar la base de datos', null, 500);
    }
};

/**
 * Descarga un archivo de respaldo específico
 */
export const downloadBackup = async (req, res) => {
    try {
        const { filename } = req.params;

        if (!filename) {
            return sendError(res, 'El nombre del archivo es requerido', null, 400);
        }

        const backupFilePath = path.join(backupsDirPath, filename);

        if (!fs.existsSync(backupFilePath)) {
            return sendError(res, 'El archivo de respaldo no existe', null, 404);
        }

        const stats = fs.statSync(backupFilePath);
        if (stats.size === 0) {
            return sendError(res, 'El archivo de respaldo está vacío', null, 400);
        }

        res.setHeader('Content-Type', 'application/sql');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        
        const fileStream = fs.createReadStream(backupFilePath);
        fileStream.pipe(res);

        fileStream.on('error', (error) => {
            console.error('Error al enviar archivo:', error);
            if (!res.headersSent) {
                sendError(res, 'Error al enviar el archivo de respaldo', null, 500);
            }
        });

    } catch (error) {
        console.error('Error al descargar respaldo:', error);
        sendError(res, 'Error al descargar el archivo de respaldo', null, 500);
    }
};
