-- Migration: free-text closure reason when admin closes a ticket definitively

USE sistema_soporte;

SET @db = DATABASE();

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'closure_reason') = 0,
    'ALTER TABLE tickets ADD COLUMN closure_reason VARCHAR(500) NULL AFTER reopened_at',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
