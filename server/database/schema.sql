-- Base de datos para Sistema de Gestión de Soporte Técnico
-- Fase 1: Autenticación y Registro

CREATE DATABASE IF NOT EXISTS sistema_soporte;
USE sistema_soporte;

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar roles por defecto
INSERT INTO roles (name, description) VALUES
('administrator', 'Administrador del sistema con acceso completo'),
('technician', 'Técnico de soporte con permisos para gestionar incidencias'),
('end_user', 'Usuario final que puede reportar incidencias');

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(100),
    role_id INT NOT NULL DEFAULT 3,
    email_verified BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_email (email),
    INDEX idx_role (role_id)
);

-- Tabla de tokens de verificación de email (2FA)
CREATE TABLE IF NOT EXISTS verification_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    type ENUM('email_verification', 'password_recovery') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user (user_id)
);

-- Fase 2: Gestión de Tickets
-- Tabla de estados de tickets (configurable por administrador)
CREATE TABLE IF NOT EXISTS ticket_states (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20) DEFAULT 'bg-gray-100',
    `order` INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar estados por defecto
INSERT INTO ticket_states (name, description, color, `order`) VALUES
('Abierto', 'Ticket creado y pendiente de asignación', 'bg-blue-100', 1),
('Asignado', 'Ticket asignado a un técnico', 'bg-yellow-100', 2),
('En Proceso', 'Técnico trabajando en la resolución', 'bg-orange-100', 3),
('Resuelto', 'Ticket resuelto, pendiente de confirmación', 'bg-green-100', 4),
('Cerrado', 'Ticket cerrado definitivamente', 'bg-gray-100', 5);

-- Tabla de categorías de tickets (configurable)
CREATE TABLE IF NOT EXISTS ticket_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar categorías por defecto
INSERT INTO ticket_categories (name, description) VALUES
('Hardware', 'Problemas relacionados con equipos físicos'),
('Software', 'Problemas relacionados con aplicaciones y programas'),
('Red', 'Problemas relacionados con conectividad y red'),
('Otro', 'Otras incidencias no categorizadas');

-- Tabla de prioridades de tickets
CREATE TABLE IF NOT EXISTS ticket_priorities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    level INT NOT NULL UNIQUE,
    color VARCHAR(20) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar prioridades por defecto con colores pasteles
INSERT INTO ticket_priorities (name, level, color, description) VALUES
('Baja', 1, 'bg-green-100', 'Prioridad baja, puede esperar'),
('Media', 2, 'bg-yellow-100', 'Prioridad media, atención normal'),
('Alta', 3, 'bg-orange-100', 'Prioridad alta, requiere atención pronta'),
('Urgente', 4, 'bg-red-100', 'Prioridad urgente, requiere atención inmediata');

-- Tabla principal de tickets
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
    INDEX idx_created_at (created_at)
);

-- Tabla de comentarios de tickets
CREATE TABLE IF NOT EXISTS ticket_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id CHAR(36) NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_ticket (ticket_id),
    INDEX idx_user (user_id),
    INDEX idx_created_at (created_at)
);

-- Tabla de historial de cambios de tickets
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
