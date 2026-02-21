-- Script para verificar qué tablas existen y cuáles necesitan renombrarse
-- Ejecuta este script primero para ver el estado actual de las tablas

USE sistema_soporte;

-- Ver todas las tablas actuales
SELECT table_name as 'Tabla Actual'
FROM information_schema.tables 
WHERE table_schema = 'sistema_soporte' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Verificar qué tablas en español aún existen
SELECT 
    CASE 
        WHEN table_name = 'usuarios' THEN 'usuarios → users'
        WHEN table_name = 'tokens_verificacion' THEN 'tokens_verificacion → verification_tokens'
        WHEN table_name = 'estados_ticket' THEN 'estados_ticket → ticket_states'
        WHEN table_name = 'categorias_ticket' THEN 'categorias_ticket → ticket_categories'
        WHEN table_name = 'prioridades_ticket' THEN 'prioridades_ticket → ticket_priorities'
        WHEN table_name = 'ticket_comentarios' THEN 'ticket_comentarios → ticket_comments'
        WHEN table_name = 'ticket_historial' THEN 'ticket_historial → ticket_history'
        ELSE 'Ya está en inglés o no necesita cambio'
    END as 'Estado de Renombrado',
    table_name as 'Nombre Actual'
FROM information_schema.tables 
WHERE table_schema = 'sistema_soporte' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('usuarios', 'tokens_verificacion', 'estados_ticket', 'categorias_ticket', 
                     'prioridades_ticket', 'ticket_comentarios', 'ticket_historial',
                     'users', 'verification_tokens', 'ticket_states', 'ticket_categories',
                     'ticket_priorities', 'ticket_comments', 'ticket_history')
ORDER BY table_name;
