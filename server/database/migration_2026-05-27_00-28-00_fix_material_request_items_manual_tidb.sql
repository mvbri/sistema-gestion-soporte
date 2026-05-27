USE sistema_soporte;

-- TiDB: separar MODIFY y ADD COLUMN; evitar AFTER encadenado en la misma sentencia.
ALTER TABLE material_request_items
    MODIFY material_type ENUM('equipment', 'consumable', 'tool', 'manual') NOT NULL;

ALTER TABLE material_request_items
    MODIFY reference_id INT NULL;

ALTER TABLE material_request_items
    ADD COLUMN source_mode ENUM('catalog', 'manual') NOT NULL DEFAULT 'catalog';

ALTER TABLE material_request_items
    ADD COLUMN custom_material_name VARCHAR(255) NULL;

ALTER TABLE material_request_items
    ADD COLUMN custom_material_description TEXT NULL;
