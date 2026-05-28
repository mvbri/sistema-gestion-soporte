-- Prioridad "Urgente": mismo estilo rojo que "Alta"
USE sistema_soporte;

UPDATE ticket_priorities
SET color = 'border border-red-500 bg-red-500/10 text-red-500'
WHERE name = 'Urgente' AND level = 4;
