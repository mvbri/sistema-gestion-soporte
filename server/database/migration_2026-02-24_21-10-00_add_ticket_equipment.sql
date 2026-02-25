-- Migration: Add ticket_equipment relationship table
-- Ejecutar este script para crear la relación entre tickets y equipos
-- Objetivo: Permitir asociar equipos del inventario a tickets para saber en qué están trabajando

USE sistema_soporte;

-- Verificar si la tabla ticket_equipment ya existe
SET @ticket_equipment_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'ticket_equipment'
);

-- Crear tabla ticket_equipment si no existe
SET @sql := IF(
    @ticket_equipment_exists = 0,
    'CREATE TABLE ticket_equipment (
        id INT PRIMARY KEY AUTO_INCREMENT,
        ticket_id CHAR(36) NOT NULL,
        equipment_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
        UNIQUE KEY unique_ticket_equipment (ticket_id, equipment_id),
        INDEX idx_ticket (ticket_id),
        INDEX idx_equipment (equipment_id)
    )',
    'SELECT 1 as skip'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
