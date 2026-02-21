-- Migration: Add incident areas (directions) table and modify tickets table
-- Execute this script to create the directions table and update the tickets table
-- This migration handles both new installations and existing databases with Spanish column names

USE sistema_soporte;

-- Create incident areas table
CREATE TABLE IF NOT EXISTS incident_areas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default directions (ignore duplicates if table already has data)
INSERT IGNORE INTO incident_areas (name, description) VALUES
('Dirección de Informática', 'Área de sistemas y tecnología'),
('Dirección de Administración', 'Área administrativa'),
('Dirección de Presupuesto', 'Área de presupuesto y finanzas'),
('Dirección de Talento Humano', 'Área de recursos humanos'),
('Sala de Reuniones', 'Salas de reuniones y espacios comunes'),
('Oficina 201', 'Oficina administrativa'),
('Oficina 202', 'Oficina administrativa'),
('Oficina 203', 'Oficina administrativa');

-- Check if incident_area_id column exists
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'tickets' 
    AND COLUMN_NAME = 'incident_area_id'
);

-- Check if old Spanish column exists
SET @old_col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'tickets' 
    AND COLUMN_NAME = 'area_incidente'
);

-- Add incident_area_id column if it doesn't exist
SET @sql = IF(@col_exists = 0,
    CONCAT('ALTER TABLE tickets ADD COLUMN incident_area_id INT NULL AFTER ',
        IF(@old_col_exists > 0, 'area_incidente', 'description')
    ),
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Migrate data from old Spanish column if it exists
-- Step 1: Create incident areas from unique values
SET @sql = IF(@old_col_exists > 0,
    'INSERT INTO incident_areas (name, description)
     SELECT DISTINCT 
         area_incidente as name,
         CONCAT(\'Migrated from tickets: \', area_incidente) as description
     FROM tickets
     WHERE area_incidente IS NOT NULL 
       AND area_incidente != \'\'
       AND area_incidente NOT IN (SELECT name FROM incident_areas)',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Update tickets with incident area IDs
SET @sql = IF(@old_col_exists > 0,
    'UPDATE tickets t
     INNER JOIN incident_areas ia ON t.area_incidente = ia.name
     SET t.incident_area_id = ia.id
     WHERE t.incident_area_id IS NULL',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Drop old Spanish column
SET @sql = IF(@old_col_exists > 0,
    'ALTER TABLE tickets DROP COLUMN area_incidente',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Make column NOT NULL (only after ensuring all rows have values)
-- Uncomment when all tickets have been assigned an incident_area_id:
-- ALTER TABLE tickets MODIFY COLUMN incident_area_id INT NOT NULL;

-- Add foreign key constraint (will fail if already exists, which is fine)
SET @fk_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tickets' 
    AND CONSTRAINT_NAME = 'fk_ticket_incident_area'
);

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE tickets ADD CONSTRAINT fk_ticket_incident_area FOREIGN KEY (incident_area_id) REFERENCES incident_areas(id) ON DELETE RESTRICT',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index (will fail if already exists, which is fine)
SET @idx_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tickets' 
    AND INDEX_NAME = 'idx_incident_area'
);

SET @sql = IF(@idx_exists = 0,
    'CREATE INDEX idx_incident_area ON tickets(incident_area_id)',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
