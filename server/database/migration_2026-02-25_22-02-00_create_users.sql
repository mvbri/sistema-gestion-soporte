-- Migration: Create users table
-- Tabla de usuarios del sistema

USE sistema_soporte;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    incident_area_id INT NULL,
    role_id INT NOT NULL DEFAULT 3,
    security_question_1 VARCHAR(255) NULL,
    security_answer_1 VARCHAR(255) NULL,
    security_question_2 VARCHAR(255) NULL,
    security_answer_2 VARCHAR(255) NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    FOREIGN KEY (incident_area_id) REFERENCES incident_areas(id) ON DELETE SET NULL,
    INDEX idx_email (email),
    INDEX idx_role (role_id),
    INDEX idx_user_incident_area (incident_area_id)
);

