CREATE TABLE IF NOT EXISTS frequent_issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    symptoms TEXT NULL,
    possible_solution TEXT NOT NULL,
    category_id INT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_frequent_issues_title (title),
    INDEX idx_frequent_issues_active (active),
    INDEX idx_frequent_issues_category_id (category_id),
    CONSTRAINT fk_frequent_issues_category
        FOREIGN KEY (category_id) REFERENCES ticket_categories(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

INSERT INTO frequent_issues (title, symptoms, possible_solution, category_id, active)
SELECT 'No enciende el equipo',
       'El equipo no responde al botón de encendido o no muestra señales de energía.',
       'Verificar conexión de energía, probar otro tomacorriente, revisar cable/power supply y validar estado de batería.',
       NULL,
       TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM frequent_issues WHERE title = 'No enciende el equipo'
);

INSERT INTO frequent_issues (title, symptoms, possible_solution, category_id, active)
SELECT 'Sin conexión a internet',
       'El usuario no puede navegar o pierde conexión de forma intermitente.',
       'Reiniciar router/switch, validar cableado o Wi-Fi, ejecutar diagnóstico de red y renovar IP.',
       NULL,
       TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM frequent_issues WHERE title = 'Sin conexión a internet'
);

INSERT INTO frequent_issues (title, symptoms, possible_solution, category_id, active)
SELECT 'Impresora no imprime',
       'La impresora aparece en línea pero no procesa trabajos.',
       'Validar cola de impresión, reiniciar servicio de impresión, revisar papel/tóner y reconectar la impresora.',
       NULL,
       TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM frequent_issues WHERE title = 'Impresora no imprime'
);
