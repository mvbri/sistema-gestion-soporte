import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { backupsDirPath } from '../config/backup.js';
import { query, getConnection } from '../config/database.js';

dotenv.config();

/**
 * Genera un respaldo completo de la base de datos usando la conexión de MariaDB
 */
export const generateBackup = async (req, res) => {
    let backupFilePath = null;
    let writeStream = null;

    try {
        const timestamp = new Date()
            .toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .substring(0, 19);
        
        const backupFileName = `backup_${timestamp}.sql`;
        backupFilePath = path.join(backupsDirPath, backupFileName);

        // Asegurar que el directorio existe
        if (!fs.existsSync(backupsDirPath)) {
            fs.mkdirSync(backupsDirPath, { recursive: true });
        }

        writeStream = fs.createWriteStream(backupFilePath);
        
        // Escribir encabezado del backup
        writeStream.write(`-- Backup generado el ${new Date().toISOString()}\n`);
        writeStream.write(`-- Sistema de Gestión de Soporte Técnico\n\n`);
        writeStream.write(`SET FOREIGN_KEY_CHECKS = 0;\n`);
        writeStream.write(`SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n\n`);

        const conn = await getConnection();
        
        try {
            // Obtener todas las tablas
            const tables = await conn.query('SHOW TABLES');
            const tableNames = tables.map(row => Object.values(row)[0]);
            
            console.log(`📊 Generando backup de ${tableNames.length} tablas...`);

            // Para cada tabla, generar CREATE TABLE y datos
            for (const tableName of tableNames) {
                console.log(`  📝 Procesando tabla: ${tableName}`);
                
                // Obtener CREATE TABLE statement
                const createTableResult = await conn.query(`SHOW CREATE TABLE \`${tableName}\``);
                const createTableSQL = createTableResult[0]['Create Table'];
                
                // Escribir DROP TABLE y CREATE TABLE
                writeStream.write(`\n-- --------------------------------------------------------\n`);
                writeStream.write(`-- Estructura de tabla para \`${tableName}\`\n`);
                writeStream.write(`-- --------------------------------------------------------\n\n`);
                writeStream.write(`DROP TABLE IF EXISTS \`${tableName}\`;\n`);
                writeStream.write(`${createTableSQL};\n\n`);
                
                // Obtener datos de la tabla
                const rows = await conn.query(`SELECT * FROM \`${tableName}\``);
                
                if (rows.length > 0) {
                    // Obtener nombres de columnas
                    const columns = Object.keys(rows[0]);
                    const columnsList = columns.map(col => `\`${col}\``).join(', ');
                    
                    writeStream.write(`-- --------------------------------------------------------\n`);
                    writeStream.write(`-- Datos de la tabla \`${tableName}\`\n`);
                    writeStream.write(`-- --------------------------------------------------------\n\n`);
                    
                    // Escribir INSERT statements
                    for (const row of rows) {
                        const values = columns.map(col => {
                            const value = row[col];
                            if (value === null || value === undefined) {
                                return 'NULL';
                            } else if (typeof value === 'string') {
                                // Escapar comillas y caracteres especiales
                                const escaped = value
                                    .replace(/\\/g, '\\\\')
                                    .replace(/'/g, "\\'")
                                    .replace(/"/g, '\\"')
                                    .replace(/\n/g, '\\n')
                                    .replace(/\r/g, '\\r')
                                    .replace(/\t/g, '\\t');
                                return `'${escaped}'`;
                            } else if (value instanceof Date) {
                                return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
                            } else {
                                return value;
                            }
                        }).join(', ');
                        
                        writeStream.write(`INSERT INTO \`${tableName}\` (${columnsList}) VALUES (${values});\n`);
                    }
                    writeStream.write(`\n`);
                }
            }
            
            // Rehabilitar verificaciones de clave foránea
            writeStream.write(`SET FOREIGN_KEY_CHECKS = 1;\n`);
            
            writeStream.end();
            
            // Esperar a que el stream termine de escribir
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });
            
            console.log(`✅ Backup generado exitosamente: ${backupFileName}`);
            
        } finally {
            conn.release();
        }

        if (!fs.existsSync(backupFilePath)) {
            throw new Error('El archivo de respaldo no se generó correctamente');
        }

        const stats = fs.statSync(backupFilePath);
        if (stats.size === 0) {
            fs.unlinkSync(backupFilePath);
            throw new Error('El respaldo generado está vacío');
        }

        // Guardar también en el directorio de backups para listado
        // (el archivo ya está guardado)

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
        console.error('Stack trace:', error.stack);
        
        if (writeStream && !writeStream.destroyed) {
            writeStream.destroy();
        }
        
        if (backupFilePath && fs.existsSync(backupFilePath)) {
            try {
                fs.unlinkSync(backupFilePath);
            } catch (unlinkError) {
                console.error('Error al eliminar archivo temporal:', unlinkError);
            }
        }

        if (error.code === 'ETIMEDOUT' || error.signal === 'SIGTERM') {
            return sendError(res, 'La operación de respaldo excedió el tiempo límite', null, 500);
        }

        sendError(res, error.message || 'Error al generar el respaldo de la base de datos', null, 500);
    }
};

/**
 * Ejecuta un archivo SQL usando la conexión de MariaDB
 */
const executeSqlFile = async (filePath) => {
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    // Procesar el contenido SQL
    let processedContent = sqlContent;
    
    // Remover comandos USE DATABASE
    processedContent = processedContent.replace(/USE\s+[`'"]?[\w]+[`'"]?\s*;/gi, '');
    
    // Remover comentarios de línea (--) pero mantener los que están dentro de strings
    processedContent = processedContent.replace(/^--.*$/gm, '');
    
    // Remover comentarios de bloque (/* ... */) pero mantener los que están dentro de strings
    processedContent = processedContent.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Dividir en statements por punto y coma, respetando strings
    const statements = [];
    let currentStatement = '';
    let inString = false;
    let stringChar = '';
    let inComment = false;
    
    for (let i = 0; i < processedContent.length; i++) {
        const char = processedContent[i];
        const nextChar = processedContent[i + 1];
        const prevChar = processedContent[i - 1];
        
        // Detectar comentarios de línea
        if (char === '-' && nextChar === '-' && !inString) {
            // Saltar hasta el final de la línea
            while (i < processedContent.length && processedContent[i] !== '\n') {
                i++;
            }
            continue;
        }
        
        // Detectar comentarios de bloque
        if (char === '/' && nextChar === '*' && !inString) {
            inComment = true;
            i++; // Saltar el *
            continue;
        }
        if (inComment && char === '*' && nextChar === '/') {
            inComment = false;
            i++; // Saltar el /
            continue;
        }
        
        if (inComment) continue;
        
        // Detectar inicio/fin de strings
        if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                inString = false;
                stringChar = '';
            }
        }
        
        currentStatement += char;
        
        // Si encontramos un punto y coma fuera de un string, es el fin de un statement
        if (char === ';' && !inString && !inComment) {
            const trimmed = currentStatement.trim();
            if (trimmed.length > 0 && trimmed !== ';') {
                statements.push(trimmed);
            }
            currentStatement = '';
        }
    }
    
    // Agregar el último statement si no termina con punto y coma
    if (currentStatement.trim().length > 0) {
        statements.push(currentStatement.trim());
    }

    const conn = await getConnection();
    
    try {
        // Deshabilitar verificaciones de clave foránea para permitir DROP TABLE
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        await conn.query('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO"');
        
        console.log(`📝 Ejecutando ${statements.length} statements del archivo SQL...`);
        
        // Ejecutar cada statement
        let executedCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            
            // Saltar statements vacíos o comentarios
            if (statement.length === 0 || 
                statement === ';' || 
                statement.match(/^\/\*/) || 
                statement.match(/^--/)) {
                continue;
            }
            
            try {
                await conn.query(statement);
                executedCount++;
                
                // Log cada 10 statements para seguimiento
                if (executedCount % 10 === 0) {
                    console.log(`  ✓ Ejecutados ${executedCount}/${statements.length} statements...`);
                }
            } catch (stmtError) {
                // Ignorar errores comunes que no son críticos
                const errorMsg = stmtError.message.toLowerCase();
                const errorCode = stmtError.code;
                
                // Errores que podemos ignorar
                const ignorableErrors = [
                    'already exists',
                    'unknown table',
                    'doesn\'t exist',
                    'duplicate entry',
                    'table doesn\'t exist',
                    'foreign key constraint',
                    'duplicate key',
                    'cannot drop',
                    'unknown database'
                ];
                
                const isIgnorable = ignorableErrors.some(err => errorMsg.includes(err));
                
                if (isIgnorable) {
                    errorCount++;
                    console.warn(`  ⚠ Statement ${i + 1} (ignorado): ${stmtError.message.substring(0, 100)}`);
                } else {
                    // Error crítico - log completo y lanzar
                    console.error(`  ❌ Error crítico en statement ${i + 1}:`);
                    console.error(`     SQL: ${statement.substring(0, 200)}...`);
                    console.error(`     Error: ${stmtError.message}`);
                    throw stmtError;
                }
            }
        }
        
        console.log(`✅ Restauración completada: ${executedCount} statements ejecutados, ${errorCount} advertencias ignoradas`);
        
        // Verificar que las tablas principales existen
        const tables = await conn.query('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);
        console.log(`📊 Tablas encontradas después de la restauración: ${tableNames.length}`);
        console.log(`   Tablas: ${tableNames.join(', ')}`);
        
        // Verificar tablas críticas
        const criticalTables = [
            'users', 
            'roles', 
            'tickets', 
            'ticket_states', 
            'ticket_priorities', 
            'ticket_categories',
            'tools',
            'tool_types',
            'equipment',
            'equipment_types',
            'consumables',
            'consumable_types'
        ];
        const missingTables = criticalTables.filter(table => !tableNames.includes(table));
        
        if (missingTables.length > 0) {
            console.warn(`⚠️  Advertencia: Las siguientes tablas críticas no se encontraron: ${missingTables.join(', ')}`);
        }
        
        // Rehabilitar verificaciones de clave foránea
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (error) {
        console.error('❌ Error durante la restauración:', error);
        // Asegurar que las verificaciones de clave foránea se rehabilen incluso si hay error
        try {
            await conn.query('SET FOREIGN_KEY_CHECKS = 1');
        } catch (resetError) {
            console.error('Error al rehabilitar FOREIGN_KEY_CHECKS:', resetError);
        }
        throw error;
    } finally {
        conn.release();
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

        if (!fs.existsSync(tempFilePath)) {
            return sendError(res, 'El archivo de respaldo no se encontró', null, 400);
        }

        const stats = fs.statSync(tempFilePath);
        if (stats.size === 0) {
            fs.unlinkSync(tempFilePath);
            return sendError(res, 'El archivo de respaldo está vacío', null, 400);
        }

        await executeSqlFile(tempFilePath);

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

        if (error.message.includes('syntax error') || error.message.includes('SQL syntax')) {
            return sendError(res, 'El archivo SQL contiene errores de sintaxis o no es válido', null, 400);
        }

        sendError(res, error.message || 'Error al restaurar la base de datos', null, 500);
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

        await executeSqlFile(backupFilePath);

        sendSuccess(res, 'Base de datos restaurada exitosamente', {
            filename: filename,
            size: stats.size
        });

    } catch (error) {
        console.error('Error al restaurar respaldo:', error);

        if (error.message.includes('syntax error') || error.message.includes('SQL syntax')) {
            return sendError(res, 'El archivo SQL contiene errores de sintaxis o no es válido', null, 400);
        }

        sendError(res, error.message || 'Error al restaurar la base de datos', null, 500);
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
