USE sistema_soporte;

CREATE TABLE IF NOT EXISTS equipment_loan_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_loan_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    created_by_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_loan_id) REFERENCES equipment_loans(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_equipment_loan_comments_loan (equipment_loan_id),
    INDEX idx_equipment_loan_comments_created_at (created_at)
);
