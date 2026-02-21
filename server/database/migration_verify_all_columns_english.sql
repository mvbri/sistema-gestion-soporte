-- Migración: Verificar y renombrar TODAS las columnas a inglés
-- Este script verifica tabla por tabla y renombra las columnas que estén en español
-- Ejecutar después de migration_rename_tables_to_english.sql

USE sistema_soporte;

-- ============================================
-- 1. TABLA: ticket_states
-- ============================================
-- Verificar y renombrar nombre -> name
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_states' AND COLUMN_NAME = 'nombre');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_states CHANGE COLUMN nombre name VARCHAR(50) NOT NULL', 
    'SELECT "ticket_states.nombre ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar descripcion -> description
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_states' AND COLUMN_NAME = 'descripcion');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_states CHANGE COLUMN descripcion description TEXT', 
    'SELECT "ticket_states.descripcion ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar orden -> order
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_states' AND COLUMN_NAME = 'orden');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_states CHANGE COLUMN orden `order` INT DEFAULT 0', 
    'SELECT "ticket_states.orden ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar activo -> active
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_states' AND COLUMN_NAME = 'activo');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_states CHANGE COLUMN activo active BOOLEAN DEFAULT TRUE', 
    'SELECT "ticket_states.activo ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 2. TABLA: ticket_categories
-- ============================================
-- Verificar y renombrar nombre -> name
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_categories' AND COLUMN_NAME = 'nombre');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_categories CHANGE COLUMN nombre name VARCHAR(100) NOT NULL', 
    'SELECT "ticket_categories.nombre ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar descripcion -> description
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_categories' AND COLUMN_NAME = 'descripcion');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_categories CHANGE COLUMN descripcion description TEXT', 
    'SELECT "ticket_categories.descripcion ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar activo -> active
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_categories' AND COLUMN_NAME = 'activo');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_categories CHANGE COLUMN activo active BOOLEAN DEFAULT TRUE', 
    'SELECT "ticket_categories.activo ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 3. TABLA: ticket_priorities
-- ============================================
-- Verificar y renombrar nombre -> name
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_priorities' AND COLUMN_NAME = 'nombre');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_priorities CHANGE COLUMN nombre name VARCHAR(50) NOT NULL', 
    'SELECT "ticket_priorities.nombre ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar nivel -> level
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_priorities' AND COLUMN_NAME = 'nivel');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_priorities CHANGE COLUMN nivel level INT NOT NULL', 
    'SELECT "ticket_priorities.nivel ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar descripcion -> description
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_priorities' AND COLUMN_NAME = 'descripcion');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_priorities CHANGE COLUMN descripcion description TEXT', 
    'SELECT "ticket_priorities.descripcion ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar activo -> active
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_priorities' AND COLUMN_NAME = 'activo');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_priorities CHANGE COLUMN activo active BOOLEAN DEFAULT TRUE', 
    'SELECT "ticket_priorities.activo ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 4. TABLA: tickets
-- ============================================
-- Verificar y renombrar titulo -> title
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'titulo');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN titulo title VARCHAR(255) NOT NULL', 
    'SELECT "tickets.titulo ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar descripcion -> description
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'descripcion');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN descripcion description TEXT NOT NULL', 
    'SELECT "tickets.descripcion ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar usuario_creador_id -> created_by_user_id
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'usuario_creador_id');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN usuario_creador_id created_by_user_id INT NOT NULL', 
    'SELECT "tickets.usuario_creador_id ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar tecnico_asignado_id -> assigned_technician_id
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'tecnico_asignado_id');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN tecnico_asignado_id assigned_technician_id INT NULL', 
    'SELECT "tickets.tecnico_asignado_id ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar imagen_url -> image_url (si existe)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'imagen_url');
SET @col_exists_en = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'image_url');
SET @sql = IF(@col_exists > 0 AND @col_exists_en = 0, 
    'ALTER TABLE tickets CHANGE COLUMN imagen_url image_url TEXT NULL', 
    'SELECT "tickets.imagen_url ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar fecha_creacion -> created_at
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'fecha_creacion');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN fecha_creacion created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP', 
    'SELECT "tickets.fecha_creacion ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar fecha_actualizacion -> updated_at
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'fecha_actualizacion');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN fecha_actualizacion updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 
    'SELECT "tickets.fecha_actualizacion ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar fecha_cierre -> closed_at
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'fecha_cierre');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN fecha_cierre closed_at TIMESTAMP NULL', 
    'SELECT "tickets.fecha_cierre ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar categoria_id -> category_id
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'categoria_id');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN categoria_id category_id INT NOT NULL', 
    'SELECT "tickets.categoria_id ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar prioridad_id -> priority_id
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'prioridad_id');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN prioridad_id priority_id INT NOT NULL', 
    'SELECT "tickets.prioridad_id ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar estado_id -> state_id
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'estado_id');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE tickets CHANGE COLUMN estado_id state_id INT NOT NULL DEFAULT 1', 
    'SELECT "tickets.estado_id ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar area_incidente -> incident_area_id (si existe como VARCHAR)
-- Nota: Si ya existe area_incidente_id, renombrarlo a incident_area_id
SET @col_exists_varchar = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'area_incidente');
SET @col_exists_id = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'area_incidente_id');
SET @col_exists_english = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'incident_area_id');

-- Si existe area_incidente como VARCHAR y no existe area_incidente_id, primero ejecutar migration_add_incident_areas.sql
SET @sql = IF(@col_exists_varchar > 0 AND @col_exists_id = 0 AND @col_exists_english = 0, 
    'SELECT "ADVERTENCIA: Existe area_incidente (VARCHAR). Ejecutar primero migration_add_incident_areas.sql para convertirla a area_incidente_id" AS message', 
    IF(@col_exists_id > 0 AND @col_exists_english = 0,
        'ALTER TABLE tickets CHANGE COLUMN area_incidente_id incident_area_id INT NOT NULL',
        'SELECT "tickets.area_incidente: OK (ya es incident_area_id o no existe)" AS message'));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 5. TABLA: ticket_comments
-- ============================================
-- Verificar y renombrar contenido -> content
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_comments' AND COLUMN_NAME = 'contenido');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_comments CHANGE COLUMN contenido content TEXT NOT NULL', 
    'SELECT "ticket_comments.contenido ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar usuario_id -> user_id
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_comments' AND COLUMN_NAME = 'usuario_id');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_comments CHANGE COLUMN usuario_id user_id INT NOT NULL', 
    'SELECT "ticket_comments.usuario_id ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar fecha_creacion -> created_at
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_comments' AND COLUMN_NAME = 'fecha_creacion');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_comments CHANGE COLUMN fecha_creacion created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP', 
    'SELECT "ticket_comments.fecha_creacion ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 6. TABLA: ticket_history
-- ============================================
-- Verificar y renombrar tipo_cambio -> change_type
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_history' AND COLUMN_NAME = 'tipo_cambio');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_history CHANGE COLUMN tipo_cambio change_type VARCHAR(50) NOT NULL', 
    'SELECT "ticket_history.tipo_cambio ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar campo_anterior -> previous_field
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_history' AND COLUMN_NAME = 'campo_anterior');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_history CHANGE COLUMN campo_anterior previous_field VARCHAR(255) NULL', 
    'SELECT "ticket_history.campo_anterior ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar campo_nuevo -> new_field
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_history' AND COLUMN_NAME = 'campo_nuevo');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_history CHANGE COLUMN campo_nuevo new_field VARCHAR(255) NULL', 
    'SELECT "ticket_history.campo_nuevo ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar descripcion -> description
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_history' AND COLUMN_NAME = 'descripcion');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_history CHANGE COLUMN descripcion description TEXT', 
    'SELECT "ticket_history.descripcion ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar fecha_cambio -> changed_at
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_history' AND COLUMN_NAME = 'fecha_cambio');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_history CHANGE COLUMN fecha_cambio changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP', 
    'SELECT "ticket_history.fecha_cambio ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar usuario_id -> user_id
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_history' AND COLUMN_NAME = 'usuario_id');
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE ticket_history CHANGE COLUMN usuario_id user_id INT NOT NULL', 
    'SELECT "ticket_history.usuario_id ya renombrada o no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 7. TABLA: incident_areas (si existe)
-- ============================================
-- Verificar si la tabla existe
SET @table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'incident_areas');

-- Verificar y renombrar nombre -> name
SET @col_exists = IF(@table_exists > 0, 
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'incident_areas' AND COLUMN_NAME = 'nombre'), 
    0);
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE incident_areas CHANGE COLUMN nombre name VARCHAR(255) NOT NULL', 
    'SELECT "incident_areas.nombre ya renombrada, no existe o la tabla no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar descripcion -> description
SET @col_exists = IF(@table_exists > 0, 
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'incident_areas' AND COLUMN_NAME = 'descripcion'), 
    0);
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE incident_areas CHANGE COLUMN descripcion description TEXT', 
    'SELECT "incident_areas.descripcion ya renombrada, no existe o la tabla no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y renombrar activo -> active
SET @col_exists = IF(@table_exists > 0, 
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'incident_areas' AND COLUMN_NAME = 'activo'), 
    0);
SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE incident_areas CHANGE COLUMN activo active BOOLEAN DEFAULT TRUE', 
    'SELECT "incident_areas.activo ya renombrada, no existe o la tabla no existe" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- RESUMEN: Verificar columnas finales
-- ============================================
SELECT '=== RESUMEN: Columnas por tabla ===' AS info;

SELECT 'ticket_states' AS tabla, COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_states'
ORDER BY ORDINAL_POSITION;

SELECT 'ticket_categories' AS tabla, COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_categories'
ORDER BY ORDINAL_POSITION;

SELECT 'ticket_priorities' AS tabla, COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_priorities'
ORDER BY ORDINAL_POSITION;

SELECT 'tickets' AS tabla, COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'tickets'
ORDER BY ORDINAL_POSITION;

SELECT 'ticket_comments' AS tabla, COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_comments'
ORDER BY ORDINAL_POSITION;

SELECT 'ticket_history' AS tabla, COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'ticket_history'
ORDER BY ORDINAL_POSITION;

SELECT 'incident_areas' AS tabla, COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'sistema_soporte' AND TABLE_NAME = 'incident_areas'
ORDER BY ORDINAL_POSITION;
