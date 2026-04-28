USE sistema_soporte;

ALTER TABLE equipment_loans
    ADD COLUMN pending_physical_condition ENUM('new', 'good', 'worn', 'damaged') NULL AFTER request_notes,
    ADD COLUMN pending_battery_level TINYINT NULL AFTER pending_physical_condition,
    ADD COLUMN pending_observations TEXT NULL AFTER pending_battery_level,
    ADD CONSTRAINT chk_equipment_loans_pending_battery
        CHECK (pending_battery_level IS NULL OR (pending_battery_level >= 0 AND pending_battery_level <= 100));
