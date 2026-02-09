import { query } from '../config/database.js';

class TicketComentario {
    static async create(data) {
        const { ticket_id, usuario_id, contenido } = data;

        const sql = `
            INSERT INTO ticket_comentarios (ticket_id, usuario_id, contenido)
            VALUES (?, ?, ?)
        `;

        const result = await query(sql, [ticket_id, usuario_id, contenido]);

        return await this.findById(result.insertId);
    }

    static async findById(id) {
        const sql = `
            SELECT 
                tc.*,
                u.full_name as usuario_nombre,
                u.email as usuario_email,
                r.name as usuario_rol
            FROM ticket_comentarios tc
            LEFT JOIN usuarios u ON tc.usuario_id = u.id
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE tc.id = ?
        `;

        const result = await query(sql, [id]);
        return result[0] || null;
    }

    static async findByTicketId(ticketId) {
        const sql = `
            SELECT 
                tc.*,
                u.full_name as usuario_nombre,
                u.email as usuario_email,
                r.name as usuario_rol
            FROM ticket_comentarios tc
            LEFT JOIN usuarios u ON tc.usuario_id = u.id
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE tc.ticket_id = ?
            ORDER BY tc.fecha_creacion ASC
        `;

        return await query(sql, [ticketId]);
    }

    static async delete(id) {
        const sql = 'DELETE FROM ticket_comentarios WHERE id = ?';
        await query(sql, [id]);
        return true;
    }
}

export default TicketComentario;
