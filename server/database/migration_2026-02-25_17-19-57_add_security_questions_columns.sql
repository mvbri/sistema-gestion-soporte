-- Migration: Add security questions columns to users table
-- Agrega las columnas de preguntas de seguridad si no existen

USE sistema_soporte;

-- Verificar y agregar security_question_1 si no existe
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'security_question_1'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE users ADD COLUMN security_question_1 VARCHAR(255) NULL AFTER incident_area_id',
    'SELECT "Column security_question_1 already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar security_answer_1 si no existe
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'security_answer_1'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE users ADD COLUMN security_answer_1 VARCHAR(255) NULL AFTER security_question_1',
    'SELECT "Column security_answer_1 already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar security_question_2 si no existe
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'security_question_2'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE users ADD COLUMN security_question_2 VARCHAR(255) NULL AFTER security_answer_1',
    'SELECT "Column security_question_2 already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar security_answer_2 si no existe
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'sistema_soporte' 
    AND TABLE_NAME = 'users' 
    AND COLUMN_NAME = 'security_answer_2'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE users ADD COLUMN security_answer_2 VARCHAR(255) NULL AFTER security_question_2',
    'SELECT "Column security_answer_2 already exists" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
