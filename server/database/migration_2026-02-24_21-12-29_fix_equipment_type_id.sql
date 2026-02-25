-- Migration: Fix equipment table - Add type_id column if missing
-- Ejecutar este script para agregar la columna type_id a la tabla equipment
-- Objetivo: Corregir el error "Unknown column 'type_id' in 'INSERT INTO'"

USE sistema_soporte;

-- Verificar si la columna type_id existe
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'equipment'
      AND COLUMN_NAME = 'type_id'
);

-- Si no existe equipment_types, crearla primero
SET @equipment_types_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'equipment_types'
);

SET @sql := IF(
    @equipment_types_exists = 0,
    'CREATE TABLE IF NOT EXISTS equipment_types (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

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

-- Agregar columna type_id si no existe
SET @sql := IF(
    @column_exists = 0,
    'ALTER TABLE equipment 
     ADD COLUMN type_id INT NOT NULL DEFAULT 1 AFTER serial_number,
     ADD FOREIGN KEY (type_id) REFERENCES equipment_types(id) ON DELETE RESTRICT,
     ADD INDEX idx_type (type_id)',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Si se agregó la columna, actualizar los registros existentes con el tipo "Otro"
SET @sql := IF(
    @column_exists = 0,
    'UPDATE equipment SET type_id = (SELECT id FROM equipment_types WHERE name = ''Otro'' LIMIT 1) WHERE type_id = 1',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
