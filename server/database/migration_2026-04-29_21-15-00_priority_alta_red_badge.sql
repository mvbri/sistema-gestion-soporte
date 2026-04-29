-- Prioridad "Alta": badge rojo (antes bg-orange-100)
USE sistema_soporte;

UPDATE ticket_priorities
SET color = 'bg-red-100'
WHERE name = 'Alta' AND level = 3;
