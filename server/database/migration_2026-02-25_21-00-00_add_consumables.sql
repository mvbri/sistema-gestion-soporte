-- Migration: Add consumables and consumable_types tables for inventory management
-- Objetivo: Gestionar inventario de consumibles (hojas, lápices, etc.) del área de informática
-- Notas:
--   - Sigue el mismo patrón que equipment / equipment_types
--   - Tabla principal: consumables
--   - Tabla auxiliar: consumable_types

USE sistema_soporte;

-- Verificar si la tabla consumable_types ya existe
SET @consumable_types_table_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'consumable_types'
);

-- Crear tabla consumable_types si no existe
SET @sql := IF(
    @consumable_types_table_exists = 0,
    'CREATE TABLE consumable_types (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_active (active)
    )',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Insertar tipos por defecto si la tabla está vacía
SET @consumable_types_count = (SELECT COUNT(*) FROM consumable_types);

SET @sql := IF(
    @consumable_types_count = 0,
    'INSERT INTO consumable_types (name, description) VALUES
    (''Paper'', ''Resmas de papel, hojas sueltas, etc.''),
    (''Writing'', ''Lápices, bolígrafos, marcadores, etc.''),
    (''Printing'', ''Tóner, cartuchos de tinta, etc.''),
    (''Office'', ''Otros consumibles de oficina''),
    (''Other'', ''Otro tipo de consumible'')',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar si la tabla consumables ya existe
SET @consumables_table_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'consumables'
);

-- Crear tabla consumables si no existe
SET @sql := IF(
    @consumables_table_exists = 0,
    'CREATE TABLE consumables (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        type_id INT NOT NULL,
        unit VARCHAR(50) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        minimum_quantity INT NOT NULL DEFAULT 0,
        status ENUM(''available'', ''low_stock'', ''out_of_stock'', ''inactive'') NOT NULL DEFAULT ''available'',
        location VARCHAR(255),
        description TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (type_id) REFERENCES consumable_types(id) ON DELETE RESTRICT,
        INDEX idx_status (status),
        INDEX idx_type (type_id),
        INDEX idx_active (active),
        INDEX idx_name (name)
    )',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

