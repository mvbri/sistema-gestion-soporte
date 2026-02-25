-- Migration: Add incident_area_id column to users table if it doesn't exist
-- Agrega la columna incident_area_id a la tabla users si no existe

USE sistema_soporte;

-- Verificar si la columna existe antes de agregarla
SET @col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'sistema_soporte'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'incident_area_id'
);

-- Agregar la columna solo si no existe
SET @sql = IF(
    @col_exists = 0,
    'ALTER TABLE users ADD COLUMN incident_area_id INT NULL AFTER department',
    'SELECT "Column incident_area_id already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar el índice si no existe
SET @idx_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'sistema_soporte'
    AND TABLE_NAME = 'users'
    AND INDEX_NAME = 'idx_user_incident_area'
);

SET @sql_idx = IF(
    @idx_exists = 0,
    'ALTER TABLE users ADD INDEX idx_user_incident_area (incident_area_id)',
    'SELECT "Index idx_user_incident_area already exists" AS message'
);

PREPARE stmt_idx FROM @sql_idx;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;

-- Agregar la foreign key si no existe
SET @fk_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'sistema_soporte'
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'incident_area_id'
    AND REFERENCED_TABLE_NAME = 'incident_areas'
);

SET @sql_fk = IF(
    @fk_exists = 0,
    'ALTER TABLE users ADD CONSTRAINT fk_user_incident_area FOREIGN KEY (incident_area_id) REFERENCES incident_areas(id) ON DELETE SET NULL',
    'SELECT "Foreign key already exists" AS message'
);

PREPARE stmt_fk FROM @sql_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;
