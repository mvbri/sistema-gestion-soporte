USE sistema_soporte;

ALTER TABLE material_requests
ADD COLUMN addressed_to VARCHAR(255) NOT NULL DEFAULT '—',
ADD COLUMN request_area VARCHAR(255) NOT NULL DEFAULT '—';
