USE sistema_soporte;

-- TiDB: pasos separados. Idempotente: MariaDB local puede tener la columna desde migration_2026-04-28_10-59-00.

SET @db = DATABASE();

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'equipment_loans' AND COLUMN_NAME = 'target_incident_area_id') = 0,
    'ALTER TABLE equipment_loans ADD COLUMN target_incident_area_id INT NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'equipment_loans'
       AND INDEX_NAME = 'idx_equipment_loans_target_incident_area') = 0,
    'ALTER TABLE equipment_loans ADD INDEX idx_equipment_loans_target_incident_area (target_incident_area_id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'equipment_loans'
       AND CONSTRAINT_NAME = 'fk_equipment_loans_target_incident_area'
       AND CONSTRAINT_TYPE = 'FOREIGN KEY') = 0,
    'ALTER TABLE equipment_loans ADD CONSTRAINT fk_equipment_loans_target_incident_area FOREIGN KEY (target_incident_area_id) REFERENCES incident_areas(id) ON DELETE SET NULL',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
