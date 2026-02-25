-- Migration: Fix equipment table - Add type_id column if missing
-- Versión simplificada - Ejecutar este script completo en tu base de datos
-- Objetivo: Corregir el error "Unknown column 'type_id' in 'INSERT INTO'"

USE sistema_soporte;

-- Crear tabla equipment_types si no existe
CREATE TABLE IF NOT EXISTS equipment_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar tipos por defecto si no existen
INSERT IGNORE INTO equipment_types (name, description) VALUES
('Laptop', 'Computadora portátil'),
('Desktop', 'Computadora de escritorio'),
('Monitor', 'Monitor de computadora'),
('Teclado', 'Teclado de computadora'),
('Mouse', 'Mouse o ratón'),
('Impresora', 'Impresora'),
('Router', 'Router o enrutador de red'),
('Switch', 'Switch de red'),
('Tablet', 'Tablet o tableta'),
('Smartphone', 'Teléfono inteligente'),
('Dron', 'Dron o vehículo aéreo no tripulado'),
('Otro', 'Otro tipo de equipo');

-- Verificar si la columna type_id existe antes de agregarla
-- Si la columna ya existe, este comando fallará pero no afectará nada
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'equipment' 
    AND COLUMN_NAME = 'type_id'
);

-- Verificar y agregar columna type_id si no existe
SET @col_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'equipment' 
    AND COLUMN_NAME = 'type_id'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE equipment ADD COLUMN type_id INT NOT NULL DEFAULT 1 AFTER serial_number',
    'SELECT "Columna type_id ya existe" as mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar foreign key (solo si la columna fue creada)
SET @fk_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'equipment' 
    AND CONSTRAINT_NAME = 'fk_equipment_type'
);

SET @sql = IF(@col_exists = 0 AND @fk_exists = 0,
    'ALTER TABLE equipment ADD CONSTRAINT fk_equipment_type FOREIGN KEY (type_id) REFERENCES equipment_types(id) ON DELETE RESTRICT',
    'SELECT "Foreign key ya existe o columna no fue creada" as mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar índice si no existe
SET @idx_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'equipment' 
    AND INDEX_NAME = 'idx_type'
);

SET @sql = IF(@idx_exists = 0,
    'CREATE INDEX idx_type ON equipment(type_id)',
    'SELECT "Índice ya existe" as mensaje'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar registros existentes con el tipo "Otro"
UPDATE equipment 
SET type_id = (SELECT id FROM equipment_types WHERE name = 'Otro' LIMIT 1) 
WHERE type_id = 1 OR type_id IS NULL;
