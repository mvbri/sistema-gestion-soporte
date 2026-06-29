-- Migration: Ticket reopen window settings and resolved_at column
-- Global configurable hours for user reopen requests after ticket is marked resolved

USE sistema_soporte;

CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value VARCHAR(500) NOT NULL,
    description VARCHAR(255) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO system_settings (setting_key, setting_value, description)
VALUES (
    'ticket_reopen_window_hours',
    '48',
    'Hours after resolution during which the ticket creator can request reopening'
)
ON DUPLICATE KEY UPDATE setting_key = setting_key;

SET @db = DATABASE();

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'resolved_at') = 0,
    'ALTER TABLE tickets ADD COLUMN resolved_at TIMESTAMP NULL AFTER closed_at',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE tickets
SET resolved_at = updated_at
WHERE state_id = 4 AND resolved_at IS NULL;
