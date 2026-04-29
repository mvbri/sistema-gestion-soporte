USE sistema_soporte;

ALTER TABLE material_request_items
    MODIFY material_type ENUM('equipment', 'consumable', 'tool', 'manual') NOT NULL,
    MODIFY reference_id INT NULL,
    ADD COLUMN source_mode ENUM('catalog', 'manual') NOT NULL DEFAULT 'catalog' AFTER material_type,
    ADD COLUMN custom_material_name VARCHAR(255) NULL AFTER reference_id,
    ADD COLUMN custom_material_description TEXT NULL AFTER custom_material_name;
