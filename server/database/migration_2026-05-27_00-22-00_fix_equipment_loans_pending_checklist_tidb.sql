USE sistema_soporte;

-- TiDB: no agregar varias columnas con AFTER referenciando la columna anterior en la misma sentencia.
ALTER TABLE equipment_loans
    ADD COLUMN pending_physical_condition ENUM('new', 'good', 'worn', 'damaged') NULL;

ALTER TABLE equipment_loans
    ADD COLUMN pending_battery_level TINYINT NULL;

ALTER TABLE equipment_loans
    ADD COLUMN pending_observations TEXT NULL;

ALTER TABLE equipment_loans
    ADD CONSTRAINT chk_equipment_loans_pending_battery
        CHECK (pending_battery_level IS NULL OR (pending_battery_level >= 0 AND pending_battery_level <= 100));
