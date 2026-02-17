-- Migración: Agregar campos de preguntas de seguridad a la tabla usuarios
-- Ejecutar este script para agregar soporte de preguntas de seguridad

USE sistema_soporte;

-- Agregar columnas para preguntas de seguridad
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS security_question_1 VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS security_answer_1 VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS security_question_2 VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS security_answer_2 VARCHAR(255) NULL;

-- Nota: Las respuestas se almacenarán hasheadas usando bcryptjs