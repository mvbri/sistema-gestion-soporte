USE sistema_soporte;

-- TiDB puede fallar si se crea el índice/FK en la misma sentencia donde se agrega la columna.
-- Aplicar en pasos para garantizar compatibilidad.

ALTER TABLE equipment_loans
    ADD COLUMN target_incident_area_id INT NULL;

ALTER TABLE equipment_loans
    ADD INDEX idx_equipment_loans_target_incident_area (target_incident_area_id);

ALTER TABLE equipment_loans
    ADD CONSTRAINT fk_equipment_loans_target_incident_area
        FOREIGN KEY (target_incident_area_id) REFERENCES incident_areas(id) ON DELETE SET NULL;

