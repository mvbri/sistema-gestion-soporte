-- Fase 2: Gestión de Tickets
-- Ejecutar este script después de schema.sql

USE sistema_soporte;

-- Tabla de estados de tickets (configurable por administrador)
CREATE TABLE IF NOT EXISTS estados_ticket (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    color VARCHAR(20) DEFAULT 'bg-gray-100',
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar estados por defecto
INSERT INTO estados_ticket (nombre, descripcion, color, orden) VALUES
('Abierto', 'Ticket creado y pendiente de asignación', 'bg-blue-100', 1),
('Asignado', 'Ticket asignado a un técnico', 'bg-yellow-100', 2),
('En Proceso', 'Técnico trabajando en la resolución', 'bg-orange-100', 3),
('Resuelto', 'Ticket resuelto, pendiente de confirmación', 'bg-green-100', 4),
('Cerrado', 'Ticket cerrado definitivamente', 'bg-gray-100', 5);

-- Tabla de categorías de tickets (configurable)
CREATE TABLE IF NOT EXISTS categorias_ticket (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar categorías por defecto
INSERT INTO categorias_ticket (nombre, descripcion) VALUES
('Hardware', 'Problemas relacionados con equipos físicos'),
('Software', 'Problemas relacionados con aplicaciones y programas'),
('Red', 'Problemas relacionados con conectividad y red'),
('Otro', 'Otras incidencias no categorizadas');

-- Tabla de prioridades de tickets
CREATE TABLE IF NOT EXISTS prioridades_ticket (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    nivel INT NOT NULL UNIQUE,
    color VARCHAR(20) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar prioridades por defecto con colores pasteles
INSERT INTO prioridades_ticket (nombre, nivel, color, descripcion) VALUES
('Baja', 1, 'bg-green-100', 'Prioridad baja, puede esperar'),
('Media', 2, 'bg-yellow-100', 'Prioridad media, atención normal'),
('Alta', 3, 'bg-orange-100', 'Prioridad alta, requiere atención pronta'),
('Urgente', 4, 'bg-red-100', 'Prioridad urgente, requiere atención inmediata');

-- Tabla principal de tickets
CREATE TABLE IF NOT EXISTS tickets (
    id CHAR(36) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    area_incidente VARCHAR(255) NOT NULL,
    categoria_id INT NOT NULL,
    prioridad_id INT NOT NULL,
    estado_id INT NOT NULL DEFAULT 1,
    usuario_creador_id INT NOT NULL,
    tecnico_asignado_id INT NULL,
    imagen_url TEXT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP NULL,
    FOREIGN KEY (categoria_id) REFERENCES categorias_ticket(id) ON DELETE RESTRICT,
    FOREIGN KEY (prioridad_id) REFERENCES prioridades_ticket(id) ON DELETE RESTRICT,
    FOREIGN KEY (estado_id) REFERENCES estados_ticket(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_creador_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (tecnico_asignado_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_usuario_creador (usuario_creador_id),
    INDEX idx_tecnico_asignado (tecnico_asignado_id),
    INDEX idx_estado (estado_id),
    INDEX idx_categoria (categoria_id),
    INDEX idx_prioridad (prioridad_id),
    INDEX idx_fecha_creacion (fecha_creacion)
);

-- Tabla de comentarios de tickets
CREATE TABLE IF NOT EXISTS ticket_comentarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id CHAR(36) NOT NULL,
    usuario_id INT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_ticket (ticket_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha_creacion (fecha_creacion)
);

-- Tabla de historial de cambios de tickets
CREATE TABLE IF NOT EXISTS ticket_historial (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id CHAR(36) NOT NULL,
    usuario_id INT NOT NULL,
    tipo_cambio VARCHAR(50) NOT NULL,
    campo_anterior VARCHAR(255) NULL,
    campo_nuevo VARCHAR(255) NULL,
    descripcion TEXT,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_ticket (ticket_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha_cambio (fecha_cambio)
);
