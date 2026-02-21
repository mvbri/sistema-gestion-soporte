-- Migración: Agregar campos de preguntas de seguridad a la tabla users
-- Ejecutar este script para agregar soporte de preguntas de seguridad
-- Compatible con MariaDB/MySQL

USE sistema_soporte;

-- Verificar y agregar columnas para preguntas de seguridad
-- Nota: Si las columnas ya existen, estos comandos fallarán silenciosamente
-- pero puedes ignorar los errores

ALTER TABLE users 
ADD COLUMN security_question_1 VARCHAR(255) NULL;

ALTER TABLE users 
ADD COLUMN security_answer_1 VARCHAR(255) NULL;

ALTER TABLE users 
ADD COLUMN security_question_2 VARCHAR(255) NULL;

ALTER TABLE users 
ADD COLUMN security_answer_2 VARCHAR(255) NULL;

-- Nota: Las respuestas se almacenarán hasheadas usando bcryptjs
