// Modelo de Usuario
import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

class Usuario {
    static async create(data) {
        const { full_name, email, password, phone, department, role_id = 3 } = data;
        
        const passwordHash = await bcrypt.hash(password, 10);
        
        const sql = `
            INSERT INTO usuarios (full_name, email, password, phone, department, role_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const result = await query(sql, [full_name, email, passwordHash, phone || null, department || null, role_id]);
        
        return {
            id: Number(result.insertId),
            full_name,
            email,
            phone,
            department,
            role_id: Number(role_id),
            email_verified: false
        };
    }

    static async findByEmail(email) {
        const sql = `
            SELECT u.*, r.name as role_name
            FROM usuarios u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = ?
        `;
        
        const result = await query(sql, [email]);
        return result[0] || null;
    }

    static async findById(id) {
        const sql = `
            SELECT u.*, r.name as role_name
            FROM usuarios u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = ?
        `;
        
        const result = await query(sql, [id]);
        return result[0] || null;
    }

    static async verifyPassword(password, passwordHash) {
        return await bcrypt.compare(password, passwordHash);
    }

    static async verifyEmail(id) {
        const sql = 'UPDATE usuarios SET email_verified = TRUE WHERE id = ?';
        await query(sql, [id]);
    }

    static async updatePassword(id, newPassword) {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        const sql = 'UPDATE usuarios SET password = ? WHERE id = ?';
        await query(sql, [passwordHash, id]);
    }

    static async emailExists(email) {
        const sql = 'SELECT id FROM usuarios WHERE email = ?';
        const result = await query(sql, [email]);
        return result.length > 0;
    }

    static async delete(id) {
        const sql = 'DELETE FROM usuarios WHERE id = ?';
        await query(sql, [id]);
    }
}

export default Usuario;

