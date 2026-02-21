-- Migración: Renombrar todas las tablas a inglés
-- Ejecutar este script para renombrar las tablas del español al inglés
-- Este script verifica si las tablas existen antes de renombrarlas

USE sistema_soporte;

-- Verificar y renombrar tablas solo si existen
-- Nota: MariaDB no soporta IF EXISTS en RENAME TABLE, así que verificamos manualmente

-- Renombrar usuarios a users (si existe)
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'sistema_soporte' AND table_name = 'usuarios');
SET @sql = IF(@table_exists > 0, 
    'RENAME TABLE usuarios TO users', 
    'SELECT "Tabla usuarios no existe, probablemente ya fue renombrada" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renombrar tokens_verificacion a verification_tokens (si existe)
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'sistema_soporte' AND table_name = 'tokens_verificacion');
SET @sql = IF(@table_exists > 0, 
    'RENAME TABLE tokens_verificacion TO verification_tokens', 
    'SELECT "Tabla tokens_verificacion no existe, probablemente ya fue renombrada" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renombrar estados_ticket a ticket_states (si existe)
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'sistema_soporte' AND table_name = 'estados_ticket');
SET @sql = IF(@table_exists > 0, 
    'RENAME TABLE estados_ticket TO ticket_states', 
    'SELECT "Tabla estados_ticket no existe, probablemente ya fue renombrada" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renombrar categorias_ticket a ticket_categories (si existe)
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'sistema_soporte' AND table_name = 'categorias_ticket');
SET @sql = IF(@table_exists > 0, 
    'RENAME TABLE categorias_ticket TO ticket_categories', 
    'SELECT "Tabla categorias_ticket no existe, probablemente ya fue renombrada" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renombrar prioridades_ticket a ticket_priorities (si existe)
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'sistema_soporte' AND table_name = 'prioridades_ticket');
SET @sql = IF(@table_exists > 0, 
    'RENAME TABLE prioridades_ticket TO ticket_priorities', 
    'SELECT "Tabla prioridades_ticket no existe, probablemente ya fue renombrada" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renombrar ticket_comentarios a ticket_comments (si existe)
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'sistema_soporte' AND table_name = 'ticket_comentarios');
SET @sql = IF(@table_exists > 0, 
    'RENAME TABLE ticket_comentarios TO ticket_comments', 
    'SELECT "Tabla ticket_comentarios no existe, probablemente ya fue renombrada" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Renombrar ticket_historial a ticket_history (si existe)
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'sistema_soporte' AND table_name = 'ticket_historial');
SET @sql = IF(@table_exists > 0, 
    'RENAME TABLE ticket_historial TO ticket_history', 
    'SELECT "Tabla ticket_historial no existe, probablemente ya fue renombrada" as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Nota: Las tablas 'roles' y 'tickets' ya están en inglés, no necesitan renombrarse
