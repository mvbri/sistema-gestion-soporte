-- Migration: Add incident_area_id (Dirección) to users table
-- Ejecutar este script después de tener creada la tabla incident_areas
-- Objetivo:
--   - Agregar la columna users.incident_area_id con FK a incident_areas.id
--   - Intentar mapear datos existentes de users.department a incident_areas.name cuando coincidan

USE sistema_soporte;

-- 1) Verificar si ya existe la columna incident_area_id en users
SET @user_inc_col_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'incident_area_id'
);

-- 2) Agregar columna si no existe
SET @sql := IF(
    @user_inc_col_exists = 0,
    'ALTER TABLE users ADD COLUMN incident_area_id INT NULL AFTER department',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3) Intentar mapear department -> incident_areas.name cuando coincidan exactamente
--    Esto es opcional y mejor esfuerzo. Si no hay coincidencia, el campo quedará NULL.
SET @sql := '
    UPDATE users u
    INNER JOIN incident_areas ia ON u.department = ia.name
    SET u.incident_area_id = ia.id
    WHERE u.department IS NOT NULL
      AND u.department <> '''''
;
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4) Agregar FK si aún no existe
SET @user_inc_fk_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND CONSTRAINT_NAME = 'fk_user_incident_area'
);

SET @sql := IF(
    @user_inc_fk_exists = 0,
    'ALTER TABLE users ADD CONSTRAINT fk_user_incident_area FOREIGN KEY (incident_area_id) REFERENCES incident_areas(id) ON DELETE SET NULL',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5) Agregar índice si aún no existe
SET @user_inc_idx_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND INDEX_NAME = 'idx_user_incident_area'
);

SET @sql := IF(
    @user_inc_idx_exists = 0,
    'CREATE INDEX idx_user_incident_area ON users(incident_area_id)',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

