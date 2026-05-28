-- Prioridades "Alta" y "Urgente": badge con borde y texto rojo
USE sistema_soporte;

UPDATE ticket_priorities
SET color = 'border border-red-500 bg-red-500/10 text-red-500'
WHERE name IN ('Alta', 'Urgente') AND level IN (3, 4);
