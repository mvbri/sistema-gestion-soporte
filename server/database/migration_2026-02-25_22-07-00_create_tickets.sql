-- Migration: Create tickets table
-- Tabla principal de tickets de soporte

USE sistema_soporte;

CREATE TABLE IF NOT EXISTS tickets (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    incident_area_id INT NOT NULL,
    category_id INT NOT NULL,
    priority_id INT NOT NULL,
    state_id INT NOT NULL DEFAULT 1,
    created_by_user_id INT NOT NULL,
    assigned_technician_id INT NULL,
    image_url TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    FOREIGN KEY (category_id) REFERENCES ticket_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (priority_id) REFERENCES ticket_priorities(id) ON DELETE RESTRICT,
    FOREIGN KEY (state_id) REFERENCES ticket_states(id) ON DELETE RESTRICT,
    FOREIGN KEY (incident_area_id) REFERENCES incident_areas(id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (assigned_technician_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_created_by_user (created_by_user_id),
    INDEX idx_assigned_technician (assigned_technician_id),
    INDEX idx_state (state_id),
    INDEX idx_category (category_id),
    INDEX idx_priority (priority_id),
    INDEX idx_created_at (created_at),
    INDEX idx_incident_area (incident_area_id)
);

