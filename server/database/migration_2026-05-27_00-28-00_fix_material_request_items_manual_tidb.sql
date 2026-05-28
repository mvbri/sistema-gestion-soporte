USE sistema_soporte;

-- TiDB: MODIFY y ADD en pasos. Idempotente si migration_2026-04-29_15-35-00 ya corrió.

SET @db = DATABASE();

ALTER TABLE material_request_items
    MODIFY material_type ENUM('equipment', 'consumable', 'tool', 'manual') NOT NULL;

ALTER TABLE material_request_items
    MODIFY reference_id INT NULL;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'material_request_items' AND COLUMN_NAME = 'source_mode') = 0,
    'ALTER TABLE material_request_items ADD COLUMN source_mode ENUM(''catalog'', ''manual'') NOT NULL DEFAULT ''catalog''',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'material_request_items' AND COLUMN_NAME = 'custom_material_name') = 0,
    'ALTER TABLE material_request_items ADD COLUMN custom_material_name VARCHAR(255) NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'material_request_items' AND COLUMN_NAME = 'custom_material_description') = 0,
    'ALTER TABLE material_request_items ADD COLUMN custom_material_description TEXT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
