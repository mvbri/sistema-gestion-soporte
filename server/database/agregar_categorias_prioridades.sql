-- Script para agregar nuevas categorías y prioridades
-- Ejecutar este script en tu base de datos MariaDB

USE sistema_soporte;

-- Agregar nuevas categorías
-- Ejemplo: Agregar una nueva categoría
INSERT INTO categorias_ticket (nombre, descripcion, activo) VALUES
('Seguridad', 'Problemas relacionados con seguridad informática y accesos', TRUE),
('Impresión', 'Problemas con impresoras y dispositivos de impresión', TRUE),
('Correo Electrónico', 'Problemas con el sistema de correo electrónico', TRUE);

-- Agregar nuevas prioridades
-- Ejemplo: Agregar una nueva prioridad (si es necesario)
-- Nota: Las prioridades tienen un nivel (1-4), asegúrate de no duplicar niveles
-- INSERT INTO prioridades_ticket (nombre, nivel, color, descripcion, activo) VALUES
-- ('Crítica', 5, 'bg-red-200', 'Prioridad crítica, requiere atención inmediata', TRUE);

-- Ver todas las categorías actuales
SELECT * FROM categorias_ticket WHERE activo = TRUE ORDER BY nombre;

-- Ver todas las prioridades actuales
SELECT * FROM prioridades_ticket WHERE activo = TRUE ORDER BY nivel;

-- Desactivar una categoría (en lugar de eliminarla)
-- UPDATE categorias_ticket SET activo = FALSE WHERE id = ?;

-- Desactivar una prioridad (en lugar de eliminarla)
-- UPDATE prioridades_ticket SET activo = FALSE WHERE id = ?;
