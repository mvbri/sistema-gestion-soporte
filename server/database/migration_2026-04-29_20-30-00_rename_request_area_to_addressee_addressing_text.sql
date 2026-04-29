USE sistema_soporte;

-- Área/dependencia del cargo destinatario + motivo, como texto redactado (no el área del solicitante).
ALTER TABLE material_requests
CHANGE COLUMN request_area addressee_addressing_text TEXT NOT NULL;
