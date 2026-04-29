USE sistema_soporte;

-- Sustituye «addressed_to» por nombre y cargo del destinatario (requiere columna addressed_to previa).
ALTER TABLE material_requests
ADD COLUMN addressee_name VARCHAR(255) NOT NULL DEFAULT '—',
ADD COLUMN addressee_title VARCHAR(255) NOT NULL DEFAULT '—';

UPDATE material_requests
SET
    addressee_name = LEFT(TRIM(addressed_to), 255),
    addressee_title = '—'
WHERE id IS NOT NULL;

ALTER TABLE material_requests DROP COLUMN addressed_to;
