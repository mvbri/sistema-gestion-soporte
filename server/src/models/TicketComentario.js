import { query } from '../config/database.js';

class TicketComentario {
    static async create(data) {
        const { ticket_id, user_id, content, created_at } = data;

        const sql = created_at
            ? `
                INSERT INTO ticket_comments (ticket_id, user_id, content, created_at)
                VALUES (?, ?, ?, ?)
            `
            : `
                INSERT INTO ticket_comments (ticket_id, user_id, content)
                VALUES (?, ?, ?)
            `;

        const params = created_at
            ? [ticket_id, user_id, content, created_at]
            : [ticket_id, user_id, content];

        const result = await query(sql, params);

        return await this.findById(result.insertId);
    }

    static async findById(id) {
        let sql = `
            SELECT 
                tc.*,
                u.full_name as user_name,
                u.email as user_email,
                r.name as user_role
            FROM ticket_comments tc
            LEFT JOIN users u ON tc.user_id = u.id
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE tc.id = ?
        `;

        try {
            const result = await query(sql, [id]);
            return result[0] || null;
        } catch (error) {
            if (error.code === 'ER_BAD_FIELD_ERROR' || (error.message && error.message.includes('Unknown column'))) {
                sql = `
                    SELECT 
                        tc.*,
                        u.full_name as user_name,
                        u.email as user_email,
                        r.nombre as user_role
                    FROM ticket_comments tc
                    LEFT JOIN users u ON tc.user_id = u.id
                    LEFT JOIN roles r ON u.role_id = r.id
                    WHERE tc.id = ?
                `;
                const result = await query(sql, [id]);
                return result[0] || null;
            }
            throw error;
        }
    }

    static async findByTicketId(ticketId) {
        let sql = `
            SELECT 
                tc.*,
                u.full_name as user_name,
                u.email as user_email,
                r.name as user_role
            FROM ticket_comments tc
            LEFT JOIN users u ON tc.user_id = u.id
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE tc.ticket_id = ?
            ORDER BY tc.created_at ASC
        `;

        try {
            return await query(sql, [ticketId]);
        } catch (error) {
            if (error.code === 'ER_BAD_FIELD_ERROR' || (error.message && error.message.includes('Unknown column'))) {
                sql = `
                    SELECT 
                        tc.*,
                        u.full_name as user_name,
                        u.email as user_email,
                        r.nombre as user_role
                    FROM ticket_comments tc
                    LEFT JOIN users u ON tc.user_id = u.id
                    LEFT JOIN roles r ON u.role_id = r.id
                    WHERE tc.ticket_id = ?
                    ORDER BY tc.created_at ASC
                `;
                return await query(sql, [ticketId]);
            }
            throw error;
        }
    }

    static async delete(id) {
        const sql = 'DELETE FROM ticket_comments WHERE id = ?';
        await query(sql, [id]);
        return true;
    }
}

export default TicketComentario;
