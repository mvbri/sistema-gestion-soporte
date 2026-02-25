-- Migration: Seed initial catalog data
-- Inserta datos por defecto en tablas de catálogo y configuración
-- Usa INSERT IGNORE para evitar errores si los datos ya existen

USE sistema_soporte;

-- Seed roles
INSERT IGNORE INTO roles (name, description) VALUES
('administrator', 'Administrador del sistema con acceso completo'),
('technician', 'Técnico de soporte con permisos para gestionar incidencias'),
('end_user', 'Usuario final que puede reportar incidencias');

-- Seed ticket states
INSERT IGNORE INTO ticket_states (name, description, color, `order`) VALUES
('Abierto', 'Ticket creado y pendiente de asignación', 'bg-blue-100', 1),
('Asignado', 'Ticket asignado a un técnico', 'bg-yellow-100', 2),
('En Proceso', 'Técnico trabajando en la resolución', 'bg-orange-100', 3),
('Resuelto', 'Ticket resuelto, pendiente de confirmación', 'bg-green-100', 4),
('Cerrado', 'Ticket cerrado definitivamente', 'bg-gray-100', 5);

-- Seed ticket categories
INSERT IGNORE INTO ticket_categories (name, description) VALUES
('Hardware', 'Problemas relacionados con equipos físicos'),
('Software', 'Problemas relacionados con aplicaciones y programas'),
('Red', 'Problemas relacionados con conectividad y red'),
('Otro', 'Otras incidencias no categorizadas');

-- Seed ticket priorities
INSERT IGNORE INTO ticket_priorities (name, level, color, description) VALUES
('Baja', 1, 'bg-green-100', 'Prioridad baja, puede esperar'),
('Media', 2, 'bg-yellow-100', 'Prioridad media, atención normal'),
('Alta', 3, 'bg-orange-100', 'Prioridad alta, requiere atención pronta'),
('Urgente', 4, 'bg-red-100', 'Prioridad urgente, requiere atención inmediata');

-- Seed incident areas (directions / locations)
INSERT IGNORE INTO incident_areas (name, description, active) VALUES
('Dirección de Informática', 'Área de sistemas y tecnología', TRUE),
('Dirección de Administración', 'Área administrativa', TRUE),
('Dirección de Presupuesto', 'Área de presupuesto y finanzas', TRUE),
('Dirección de Talento Humano', 'Área de recursos humanos', TRUE),
('Sala de Reuniones', 'Salas de reuniones y espacios comunes', TRUE),
('Oficina 201', 'Oficina administrativa', TRUE),
('Oficina 202', 'Oficina administrativa', TRUE),
('Oficina 203', 'Oficina administrativa', TRUE);

