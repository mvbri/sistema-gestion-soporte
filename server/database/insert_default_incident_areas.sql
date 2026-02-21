-- Insert default incident areas manually
-- Execute this script to insert the 3 main directions mentioned in the example

USE sistema_soporte;

-- Insert the 3 main directions
INSERT INTO incident_areas (name, description) VALUES
('Dirección de Informática', 'Área de sistemas y tecnología'),
('Dirección de Administración', 'Área administrativa'),
('Dirección de Presupuesto', 'Área de presupuesto y finanzas')
ON DUPLICATE KEY UPDATE name=name;
