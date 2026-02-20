import { query } from '../config/database.js';

class TicketHistorial {
    static async create(data) {
        const {
            ticket_id,
            usuario_id,
            tipo_cambio,
            campo_anterior,
            campo_nuevo,
            descripcion,
            fecha_cambio
        } = data;

        const sql = fecha_cambio
            ? `
                INSERT INTO ticket_historial (
                    ticket_id, usuario_id, tipo_cambio,
                    campo_anterior, campo_nuevo, descripcion, fecha_cambio
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `
            : `
                INSERT INTO ticket_historial (
                    ticket_id, usuario_id, tipo_cambio,
                    campo_anterior, campo_nuevo, descripcion
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;

        const params = fecha_cambio
            ? [
                ticket_id,
                usuario_id,
                tipo_cambio,
                campo_anterior || null,
                campo_nuevo || null,
                descripcion || null,
                fecha_cambio
            ]
            : [
                ticket_id,
                usuario_id,
                tipo_cambio,
                campo_anterior || null,
                campo_nuevo || null,
                descripcion || null
            ];

        const result = await query(sql, params);

        return await this.findById(result.insertId);
    }

    static async findById(id) {
        const sql = `
            SELECT 
                th.*,
                u.full_name as usuario_nombre,
                u.email as usuario_email
            FROM ticket_historial th
            LEFT JOIN usuarios u ON th.usuario_id = u.id
            WHERE th.id = ?
        `;

        const result = await query(sql, [id]);
        return result[0] || null;
    }

    static async findByTicketId(ticketId) {
        const sql = `
            SELECT 
                th.*,
                u.full_name as usuario_nombre,
                u.email as usuario_email
            FROM ticket_historial th
            LEFT JOIN usuarios u ON th.usuario_id = u.id
            WHERE th.ticket_id = ?
            ORDER BY th.fecha_cambio DESC
        `;

        return await query(sql, [ticketId]);
    }
}

export default TicketHistorial;
