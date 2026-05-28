USE sistema_soporte;

-- TiDB: columnas en pasos separados. Idempotente si migration_2026-04-28_11-32-00 ya corrió.

SET @db = DATABASE();

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'equipment_loans' AND COLUMN_NAME = 'pending_physical_condition') = 0,
    'ALTER TABLE equipment_loans ADD COLUMN pending_physical_condition ENUM(''new'', ''good'', ''worn'', ''damaged'') NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'equipment_loans' AND COLUMN_NAME = 'pending_battery_level') = 0,
    'ALTER TABLE equipment_loans ADD COLUMN pending_battery_level TINYINT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'equipment_loans' AND COLUMN_NAME = 'pending_observations') = 0,
    'ALTER TABLE equipment_loans ADD COLUMN pending_observations TEXT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'equipment_loans'
       AND CONSTRAINT_NAME = 'chk_equipment_loans_pending_battery'
       AND CONSTRAINT_TYPE = 'CHECK') = 0,
    'ALTER TABLE equipment_loans ADD CONSTRAINT chk_equipment_loans_pending_battery CHECK (pending_battery_level IS NULL OR (pending_battery_level >= 0 AND pending_battery_level <= 100))',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
