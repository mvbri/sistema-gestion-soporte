USE sistema_soporte;

-- Quitar columna si existía (p. ej. si se aplicó la migración intermedia con «no aplica»).
ALTER TABLE material_request_items DROP COLUMN IF EXISTS quantity_not_applicable;
