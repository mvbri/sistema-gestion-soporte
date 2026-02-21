-- Migración: Asegurar que todas las columnas de tickets estén en inglés
-- Este script verifica y renombra las columnas que aún estén en español
-- Ejecutar después de migration_rename_tables_to_english.sql y migration_rename_columns_to_english.sql

USE sistema_soporte;

-- Verificar y renombrar columnas de tickets una por una
-- Esto evita errores si alguna columna ya está renombrada

-- Renombrar titulo a title (si existe)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' 
    AND TABLE_NAME = 'tickets' 
    AND COLUMN_NAME = 'titulo');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN titulo title VARCHAR(255) NOT NULL', 
    'SELECT "Columna titulo ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renombrar descripcion a description (si existe)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' 
    AND TABLE_NAME = 'tickets' 
    AND COLUMN_NAME = 'descripcion');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN descripcion description TEXT NOT NULL', 
    'SELECT "Columna descripcion ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renombrar usuario_creador_id a created_by_user_id (si existe)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' 
    AND TABLE_NAME = 'tickets' 
    AND COLUMN_NAME = 'usuario_creador_id');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN usuario_creador_id created_by_user_id INT NOT NULL', 
    'SELECT "Columna usuario_creador_id ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renombrar tecnico_asignado_id a assigned_technician_id (si existe)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' 
    AND TABLE_NAME = 'tickets' 
    AND COLUMN_NAME = 'tecnico_asignado_id');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN tecnico_asignado_id assigned_technician_id INT NULL', 
    'SELECT "Columna tecnico_asignado_id ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renombrar imagen_url a image_url (si existe y está en español)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' 
    AND TABLE_NAME = 'tickets' 
    AND COLUMN_NAME = 'imagen_url');
SET @col_exists_en = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' 
    AND TABLE_NAME = 'tickets' 
    AND COLUMN_NAME = 'image_url');
SET @sql = IF(@col_exists > 0 AND @col_exists_en = 0, 
    'ALTER TABLE tickets CHANGE COLUMN imagen_url image_url TEXT NULL', 
    'SELECT "Columna imagen_url ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renombrar fecha_creacion a created_at (si existe)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' 
    AND TABLE_NAME = 'tickets' 
    AND COLUMN_NAME = 'fecha_creacion');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN fecha_creacion created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP', 
    'SELECT "Columna fecha_creacion ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renombrar fecha_actualizacion a updated_at (si existe)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' 
    AND TABLE_NAME = 'tickets' 
    AND COLUMN_NAME = 'fecha_actualizacion');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN fecha_actualizacion updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 
    'SELECT "Columna fecha_actualizacion ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renombrar fecha_cierre a closed_at (si existe)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' 
    AND TABLE_NAME = 'tickets' 
    AND COLUMN_NAME = 'fecha_cierre');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN fecha_cierre closed_at TIMESTAMP NULL', 
    'SELECT "Columna fecha_cierre ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar columnas finales
SELECT 'Columnas de tickets después de la migración:' AS info;
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_soporte' 
AND TABLE_NAME = 'tickets'
ORDER BY ORDINAL_POSITION;
