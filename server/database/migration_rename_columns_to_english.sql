-- Migración: Renombrar todas las columnas a inglés
-- Ejecutar este script para renombrar las columnas del español al inglés
-- IMPORTANTE: Ejecutar primero migration_rename_tables_to_english.sql si no se ha hecho

USE sistema_soporte;

-- Renombrar columnas de ticket_states
ALTER TABLE ticket_states 
CHANGE COLUMN nombre name VARCHAR(50) NOT NULL,
CHANGE COLUMN descripcion description TEXT,
CHANGE COLUMN orden `order` INT DEFAULT 0,
CHANGE COLUMN activo active BOOLEAN DEFAULT TRUE;

-- Renombrar columnas de ticket_categories
ALTER TABLE ticket_categories 
CHANGE COLUMN nombre name VARCHAR(100) NOT NULL,
CHANGE COLUMN descripcion description TEXT,
CHANGE COLUMN activo active BOOLEAN DEFAULT TRUE;

-- Renombrar columnas de ticket_priorities
ALTER TABLE ticket_priorities 
CHANGE COLUMN nombre name VARCHAR(50) NOT NULL,
CHANGE COLUMN nivel level INT NOT NULL,
CHANGE COLUMN descripcion description TEXT,
CHANGE COLUMN activo active BOOLEAN DEFAULT TRUE;

-- Renombrar columnas de tickets
-- Verificar si las columnas existen antes de renombrarlas
ALTER TABLE tickets 
CHANGE COLUMN titulo title VARCHAR(255) NOT NULL,
CHANGE COLUMN descripcion description TEXT NOT NULL,
CHANGE COLUMN usuario_creador_id created_by_user_id INT NOT NULL,
CHANGE COLUMN tecnico_asignado_id assigned_technician_id INT NULL,
CHANGE COLUMN imagen_url image_url TEXT NULL,
CHANGE COLUMN fecha_creacion created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CHANGE COLUMN fecha_actualizacion updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
CHANGE COLUMN fecha_cierre closed_at TIMESTAMP NULL;

-- Nota: Si existe la columna area_incidente (sin _id), ejecutar primero migration_add_incident_areas.sql
-- para convertirla a area_incidente_id antes de continuar

-- Actualizar índices de tickets
-- Nota: Si los índices no existen, estos comandos fallarán. Ejecuta solo los que correspondan
ALTER TABLE tickets 
DROP INDEX idx_usuario_creador,
DROP INDEX idx_tecnico_asignado,
DROP INDEX idx_fecha_creacion;

ALTER TABLE tickets 
ADD INDEX idx_created_by_user (created_by_user_id),
ADD INDEX idx_assigned_technician (assigned_technician_id),
ADD INDEX idx_created_at (created_at);

-- Actualizar foreign keys de tickets
-- IMPORTANTE: Si los nombres de las foreign keys son diferentes, consulta primero:
-- SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets' AND COLUMN_NAME IN ('usuario_creador_id', 'tecnico_asignado_id') AND REFERENCED_TABLE_NAME IS NOT NULL;
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar foreign keys (ajusta los nombres según tu base de datos)
ALTER TABLE tickets DROP FOREIGN KEY tickets_ibfk_4;
ALTER TABLE tickets DROP FOREIGN KEY tickets_ibfk_5;

SET FOREIGN_KEY_CHECKS = 1;

-- Agregar nuevas foreign keys
ALTER TABLE tickets 
ADD CONSTRAINT fk_ticket_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
ADD CONSTRAINT fk_ticket_assigned_technician FOREIGN KEY (assigned_technician_id) REFERENCES users(id) ON DELETE SET NULL;

-- Renombrar columnas de ticket_comments
ALTER TABLE ticket_comments 
CHANGE COLUMN contenido content TEXT NOT NULL,
CHANGE COLUMN fecha_creacion created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CHANGE COLUMN usuario_id user_id INT NOT NULL;

-- Actualizar índices de ticket_comments
ALTER TABLE ticket_comments 
DROP INDEX idx_usuario,
DROP INDEX idx_fecha_creacion;

ALTER TABLE ticket_comments 
ADD INDEX idx_user (user_id),
ADD INDEX idx_created_at (created_at);

-- Actualizar foreign key de ticket_comments
-- IMPORTANTE: Si el nombre es diferente, consulta primero:
-- SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_comments' AND COLUMN_NAME = 'usuario_id' AND REFERENCED_TABLE_NAME IS NOT NULL;
SET FOREIGN_KEY_CHECKS = 0;
ALTER TABLE ticket_comments DROP FOREIGN KEY ticket_comments_ibfk_2;
SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE ticket_comments 
ADD CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;

-- Renombrar columnas de ticket_history
ALTER TABLE ticket_history 
CHANGE COLUMN tipo_cambio change_type VARCHAR(50) NOT NULL,
CHANGE COLUMN campo_anterior previous_field VARCHAR(255) NULL,
CHANGE COLUMN campo_nuevo new_field VARCHAR(255) NULL,
CHANGE COLUMN descripcion description TEXT,
CHANGE COLUMN fecha_cambio changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CHANGE COLUMN usuario_id user_id INT NOT NULL;

-- Actualizar índices de ticket_history
ALTER TABLE ticket_history 
DROP INDEX idx_usuario,
DROP INDEX idx_fecha_cambio;

ALTER TABLE ticket_history 
ADD INDEX idx_user (user_id),
ADD INDEX idx_changed_at (changed_at);

-- Actualizar foreign key de ticket_history
-- IMPORTANTE: Si el nombre es diferente, consulta primero:
-- SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_history' AND COLUMN_NAME = 'usuario_id' AND REFERENCED_TABLE_NAME IS NOT NULL;
SET FOREIGN_KEY_CHECKS = 0;
ALTER TABLE ticket_history DROP FOREIGN KEY ticket_history_ibfk_2;
SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE ticket_history 
ADD CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;

-- Renombrar columnas de incident_areas (si existe)
ALTER TABLE incident_areas 
CHANGE COLUMN nombre name VARCHAR(255) NOT NULL,
CHANGE COLUMN descripcion description TEXT,
CHANGE COLUMN activo active BOOLEAN DEFAULT TRUE;
