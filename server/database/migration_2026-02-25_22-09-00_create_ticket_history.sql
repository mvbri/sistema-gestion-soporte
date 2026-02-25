-- Migration: Create ticket_history table
-- Historial de cambios de los tickets

USE sistema_soporte;

CREATE TABLE IF NOT EXISTS ticket_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id CHAR(36) NOT NULL,
    user_id INT NOT NULL,
    change_type VARCHAR(50) NOT NULL,
    previous_field VARCHAR(255) NULL,
    new_field VARCHAR(255) NULL,
    description TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_ticket (ticket_id),
    INDEX idx_user (user_id),
    INDEX idx_changed_at (changed_at)
);

