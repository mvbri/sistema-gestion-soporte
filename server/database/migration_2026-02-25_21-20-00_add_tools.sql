-- Migration: Add tools and tool_types tables for tools inventory management
-- Objetivo: Gestionar inventario de herramientas (destornilladores, cables, etc.) de la dirección de informática
-- Notas:
--   - Sigue el mismo patrón que equipment / equipment_types y consumables / consumable_types
--   - Tabla principal: tools
--   - Tabla auxiliar: tool_types

USE sistema_soporte;

-- Verificar si la tabla tool_types ya existe
SET @tool_types_table_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tool_types'
);

-- Crear tabla tool_types si no existe
SET @sql := IF(
    @tool_types_table_exists = 0,
    'CREATE TABLE tool_types (
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
SET @tool_types_count = (SELECT COUNT(*) FROM tool_types);

SET @sql := IF(
    @tool_types_count = 0,
    'INSERT INTO tool_types (name, description) VALUES
    (''Hand Tool'', ''Herramientas manuales como destornilladores, alicates, llaves, etc.''),
    (''Cable'', ''Cables de red, alimentación, HDMI, USB, etc.''),
    (''Network'', ''Herramientas de red como crimpadoras, probadores de cable, etc.''),
    (''Peripheral'', ''Periféricos pequeños como ratones, teclados, adaptadores, etc.''),
    (''Other'', ''Otro tipo de herramienta'')',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar si la tabla tools ya existe
SET @tools_table_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tools'
);

-- Crear tabla tools si no existe
SET @sql := IF(
    @tools_table_exists = 0,
    'CREATE TABLE tools (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(100) UNIQUE,
        type_id INT NOT NULL,
        status ENUM(''available'', ''assigned'', ''maintenance'', ''lost'', ''retired'') NOT NULL DEFAULT ''available'',
        condition ENUM(''new'', ''good'', ''worn'', ''broken'') NOT NULL DEFAULT ''good'',
        location VARCHAR(255),
        assigned_to_user_id INT NULL,
        description TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (type_id) REFERENCES tool_types(id) ON DELETE RESTRICT,
        INDEX idx_status (status),
        INDEX idx_type (type_id),
        INDEX idx_assigned_user (assigned_to_user_id),
        INDEX idx_active (active),
        INDEX idx_code (code)
    )',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

