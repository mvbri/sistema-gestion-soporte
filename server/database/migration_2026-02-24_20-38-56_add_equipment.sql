-- Migration: Add equipment table for inventory management
-- Ejecutar este script para crear la tabla de equipos
-- Objetivo: Crear tabla para gestionar inventario de equipos de la dirección de informática
-- IMPORTANTE: Ejecutar primero migration_add_equipment_types.sql

USE sistema_soporte;

-- Verificar si la tabla equipment_types existe
SET @equipment_types_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'equipment_types'
);

-- Si no existe equipment_types, crear una referencia temporal
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

-- Verificar si la tabla equipment ya existe
SET @equipment_table_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'equipment'
);

-- Crear tabla equipment si no existe
SET @sql := IF(
    @equipment_table_exists = 0,
    'CREATE TABLE equipment (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(100),
        model VARCHAR(100),
        serial_number VARCHAR(100) UNIQUE,
        type_id INT NOT NULL,
        status ENUM(''available'', ''assigned'', ''maintenance'', ''retired'') NOT NULL DEFAULT ''available'',
        location VARCHAR(255),
        assigned_to_user_id INT NULL,
        description TEXT,
        purchase_date DATE NULL,
        warranty_expires_at DATE NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (type_id) REFERENCES equipment_types(id) ON DELETE RESTRICT,
        INDEX idx_status (status),
        INDEX idx_type (type_id),
        INDEX idx_assigned_user (assigned_to_user_id),
        INDEX idx_active (active),
        INDEX idx_serial_number (serial_number)
    )',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
