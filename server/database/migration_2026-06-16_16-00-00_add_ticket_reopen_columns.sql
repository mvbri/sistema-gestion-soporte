-- Migration: reopened flag and reopened_at timestamp for ticket reopen flow
-- Internal state remains En Proceso (3); UI shows Reabierto badge when reopened = TRUE

USE sistema_soporte;

SET @db = DATABASE();

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'reopened') = 0,
    'ALTER TABLE tickets ADD COLUMN reopened BOOLEAN NOT NULL DEFAULT FALSE AFTER resolved_at',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'reopened_at') = 0,
    'ALTER TABLE tickets ADD COLUMN reopened_at TIMESTAMP NULL AFTER reopened',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
