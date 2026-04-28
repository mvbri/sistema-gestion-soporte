USE sistema_soporte;

ALTER TABLE equipment_loans
    ADD COLUMN target_incident_area_id INT NULL AFTER requester_user_id,
    ADD INDEX idx_equipment_loans_target_incident_area (target_incident_area_id),
    ADD CONSTRAINT fk_equipment_loans_target_incident_area
        FOREIGN KEY (target_incident_area_id) REFERENCES incident_areas(id) ON DELETE SET NULL;
