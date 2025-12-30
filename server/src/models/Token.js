// Modelo de Token para verificación y recuperación
import { query } from '../config/database.js';

class Token {
    static async create(userId, token, type, expirationHours = 24) {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + expirationHours);
        
        const sql = `
            INSERT INTO tokens_verificacion (user_id, token, type, expires_at)
            VALUES (?, ?, ?, ?)
        `;
        
        await query(sql, [userId, token, type, expiresAt]);
        return { token, expires_at: expiresAt };
    }

    static async findValid(token, type) {
        const sql = `
            SELECT t.id, t.user_id, t.token, t.type, t.expires_at, t.used, t.created_at,
                   u.email, u.full_name, u.email_verified
            FROM tokens_verificacion t
            JOIN usuarios u ON t.user_id = u.id
            WHERE t.token = ? 
            AND t.type = ?
            AND t.used = FALSE
            AND t.expires_at > NOW()
        `;
        
        const result = await query(sql, [token, type]);
        if (!result[0]) return null;
        
        return {
            ...result[0],
            id: Number(result[0].id),
            user_id: Number(result[0].user_id)
        };
    }

    static async markAsUsed(token) {
        const sql = 'UPDATE tokens_verificacion SET used = TRUE WHERE token = ?';
        await query(sql, [token]);
    }

    static async deleteExpired() {
        const sql = 'DELETE FROM tokens_verificacion WHERE expires_at < NOW()';
        await query(sql);
    }

    static async deleteByUser(userId, type) {
        const sql = 'DELETE FROM tokens_verificacion WHERE user_id = ? AND type = ?';
        await query(sql, [userId, type]);
    }
}

export default Token;

