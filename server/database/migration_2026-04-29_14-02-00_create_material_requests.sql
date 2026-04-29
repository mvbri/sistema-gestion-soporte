USE sistema_soporte;

CREATE TABLE IF NOT EXISTS material_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    requester_user_id INT NOT NULL,
    approved_by_user_id INT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    request_notes TEXT NULL,
    approval_notes TEXT NULL,
    rejection_reason TEXT NULL,
    cancelled_notes TEXT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_material_requests_status (status),
    INDEX idx_material_requests_requester_user (requester_user_id),
    INDEX idx_material_requests_created_at (created_at),
    INDEX idx_material_requests_active (active)
);

CREATE TABLE IF NOT EXISTS material_request_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_request_id INT NOT NULL,
    material_type ENUM('equipment', 'consumable', 'tool') NOT NULL,
    reference_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_material_request_items_quantity CHECK (quantity > 0),
    FOREIGN KEY (material_request_id) REFERENCES material_requests(id) ON DELETE CASCADE,
    INDEX idx_material_request_items_request (material_request_id),
    INDEX idx_material_request_items_type_reference (material_type, reference_id),
    INDEX idx_material_request_items_active (active)
);

CREATE TABLE IF NOT EXISTS material_request_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_request_id INT NOT NULL,
    changed_by_user_id INT NOT NULL,
    previous_status ENUM('pending', 'approved', 'rejected', 'cancelled') NULL,
    new_status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_request_id) REFERENCES material_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_material_request_history_request (material_request_id),
    INDEX idx_material_request_history_status (new_status)
);

CREATE TABLE IF NOT EXISTS material_request_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    material_request_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    created_by_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_request_id) REFERENCES material_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_material_request_comments_request (material_request_id),
    INDEX idx_material_request_comments_created_at (created_at)
);
