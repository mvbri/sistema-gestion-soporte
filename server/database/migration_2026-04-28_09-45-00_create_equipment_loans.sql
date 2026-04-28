USE sistema_soporte;

CREATE TABLE IF NOT EXISTS equipment_pools (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL UNIQUE,
    description TEXT NULL,
    total_stock INT NOT NULL DEFAULT 0,
    available_stock INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_equipment_pools_stock_non_negative CHECK (total_stock >= 0),
    CONSTRAINT chk_equipment_pools_available_non_negative CHECK (available_stock >= 0),
    CONSTRAINT chk_equipment_pools_available_not_greater_total CHECK (available_stock <= total_stock),
    INDEX idx_equipment_pools_active (active),
    INDEX idx_equipment_pools_name (name)
);

CREATE TABLE IF NOT EXISTS equipment_loans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    requester_user_id INT NOT NULL,
    approved_by_user_id INT NULL,
    delivered_by_user_id INT NULL,
    returned_by_user_id INT NULL,
    status ENUM('pending', 'approved', 'delivered', 'returned', 'rejected', 'overdue', 'cancelled') NOT NULL DEFAULT 'pending',
    request_notes TEXT NULL,
    approval_notes TEXT NULL,
    rejection_reason TEXT NULL,
    start_date DATE NOT NULL,
    expected_return_date DATE NOT NULL,
    delivered_at DATETIME NULL,
    returned_at DATETIME NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_equipment_loans_dates CHECK (expected_return_date >= start_date),
    FOREIGN KEY (requester_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (delivered_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (returned_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_equipment_loans_status (status),
    INDEX idx_equipment_loans_requester (requester_user_id),
    INDEX idx_equipment_loans_dates (start_date, expected_return_date),
    INDEX idx_equipment_loans_active (active)
);

CREATE TABLE IF NOT EXISTS equipment_loan_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    loan_id INT NOT NULL,
    equipment_id INT NULL,
    pool_id INT NULL,
    quantity INT NOT NULL DEFAULT 1,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_equipment_loan_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_equipment_loan_items_target CHECK (
        (equipment_id IS NOT NULL AND pool_id IS NULL) OR
        (equipment_id IS NULL AND pool_id IS NOT NULL)
    ),
    FOREIGN KEY (loan_id) REFERENCES equipment_loans(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT,
    FOREIGN KEY (pool_id) REFERENCES equipment_pools(id) ON DELETE RESTRICT,
    INDEX idx_equipment_loan_items_loan (loan_id),
    INDEX idx_equipment_loan_items_equipment (equipment_id),
    INDEX idx_equipment_loan_items_pool (pool_id),
    INDEX idx_equipment_loan_items_active (active)
);

CREATE TABLE IF NOT EXISTS equipment_loan_checklists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    loan_item_id INT NOT NULL,
    checklist_type ENUM('delivery', 'return') NOT NULL,
    battery_level TINYINT NULL,
    physical_condition ENUM('new', 'good', 'worn', 'damaged') NOT NULL DEFAULT 'good',
    accessories TEXT NULL,
    observations TEXT NULL,
    created_by_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_equipment_loan_checklists_battery CHECK (
        battery_level IS NULL OR (battery_level >= 0 AND battery_level <= 100)
    ),
    FOREIGN KEY (loan_item_id) REFERENCES equipment_loan_items(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_equipment_loan_checklists_item (loan_item_id),
    INDEX idx_equipment_loan_checklists_type (checklist_type)
);

CREATE TABLE IF NOT EXISTS equipment_loan_incidents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    loan_item_id INT NOT NULL,
    incident_type ENUM('damage', 'loss', 'missing_accessory', 'other') NOT NULL,
    description TEXT NOT NULL,
    estimated_cost DECIMAL(10, 2) NULL,
    reported_by_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_item_id) REFERENCES equipment_loan_items(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_equipment_loan_incidents_item (loan_item_id),
    INDEX idx_equipment_loan_incidents_type (incident_type)
);

CREATE TABLE IF NOT EXISTS equipment_loan_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    loan_id INT NOT NULL,
    changed_by_user_id INT NOT NULL,
    previous_status ENUM('pending', 'approved', 'delivered', 'returned', 'rejected', 'overdue', 'cancelled') NULL,
    new_status ENUM('pending', 'approved', 'delivered', 'returned', 'rejected', 'overdue', 'cancelled') NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES equipment_loans(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_equipment_loan_history_loan (loan_id),
    INDEX idx_equipment_loan_history_status (new_status)
);
