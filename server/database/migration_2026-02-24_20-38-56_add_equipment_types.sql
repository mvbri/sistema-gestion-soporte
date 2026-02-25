-- Migration: Add equipment_types table for managing equipment types
-- Ejecutar este script para crear la tabla de tipos de equipos
-- Objetivo: Crear tabla para gestionar tipos de equipos configurable por administrador

USE sistema_soporte;

-- Verificar si la tabla equipment_types ya existe
SET @equipment_types_table_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'equipment_types'
);

-- Crear tabla equipment_types si no existe
SET @sql := IF(
    @equipment_types_table_exists = 0,
    'CREATE TABLE equipment_types (
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
SET @equipment_types_count = (SELECT COUNT(*) FROM equipment_types);

SET @sql := IF(
    @equipment_types_count = 0,
    'INSERT INTO equipment_types (name, description) VALUES
    (''Laptop'', ''Computadora portátil''),
    (''Desktop'', ''Computadora de escritorio''),
    (''Monitor'', ''Monitor o pantalla''),
    (''Impresora'', ''Impresora o dispositivo de impresión''),
    (''Dispositivo de Red'', ''Router, switch, access point u otro dispositivo de red''),
    (''Otro'', ''Otro tipo de equipo'')',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
