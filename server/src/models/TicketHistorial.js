import { query } from '../config/database.js';

class TicketHistorial {
    static async create(data) {
        const {
            ticket_id,
            user_id,
            change_type,
            previous_field,
            new_field,
            description,
            changed_at
        } = data;

        const sql = changed_at
            ? `
                INSERT INTO ticket_history (
                    ticket_id, user_id, change_type,
                    previous_field, new_field, description, changed_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `
            : `
                INSERT INTO ticket_history (
                    ticket_id, user_id, change_type,
                    previous_field, new_field, description
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;

        const params = changed_at
            ? [
                ticket_id,
                user_id,
                change_type,
                previous_field || null,
                new_field || null,
                description || null,
                changed_at
            ]
            : [
                ticket_id,
                user_id,
                change_type,
                previous_field || null,
                new_field || null,
                description || null
            ];

        const result = await query(sql, params);

        return await this.findById(result.insertId);
    }

    static async findById(id) {
        const sql = `
            SELECT 
                th.*,
                u.full_name as user_name,
                u.email as user_email
            FROM ticket_history th
            LEFT JOIN users u ON th.user_id = u.id
            WHERE th.id = ?
        `;

        const result = await query(sql, [id]);
        return result[0] || null;
    }

    static async findByTicketId(ticketId) {
        const sql = `
            SELECT 
                th.*,
                u.full_name as user_name,
                u.email as user_email
            FROM ticket_history th
            LEFT JOIN users u ON th.user_id = u.id
            WHERE th.ticket_id = ?
            ORDER BY th.changed_at DESC
        `;

        return await query(sql, [ticketId]);
    }
}

export default TicketHistorial;
