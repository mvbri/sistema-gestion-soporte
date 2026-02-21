import { query } from '../config/database.js';
import { randomUUID } from 'crypto';

class Ticket {
    static async create(data) {
        const {
            title,
            description,
            incident_area_id,
            category_id,
            priority_id,
            created_by_user_id,
            image_url
        } = data;

        const ticketId = randomUUID();

        let sql = `
            INSERT INTO tickets (
                id, title, description, incident_area_id, category_id,
                priority_id, state_id, created_by_user_id, image_url
            )
            VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
        `;

        try {
            await query(sql, [
                ticketId,
                title,
                description,
                incident_area_id,
                category_id,
                priority_id,
                created_by_user_id,
                image_url || null
            ]);
        } catch (error) {
            throw error;
        }

        return await this.findById(ticketId);
    }

    static async findById(id) {
        let sql = `
            SELECT 
                t.*,
                c.name as category_name,
                p.name as priority_name,
                p.color as priority_color,
                p.level as priority_level,
                e.name as state_name,
                e.color as state_color,
                ia.name as incident_area_name,
                u1.full_name as created_by_user_name,
                u1.email as created_by_user_email,
                u2.full_name as assigned_technician_name,
                u2.email as assigned_technician_email
            FROM tickets t
            LEFT JOIN ticket_categories c ON t.category_id = c.id
            LEFT JOIN ticket_priorities p ON t.priority_id = p.id
            LEFT JOIN ticket_states e ON t.state_id = e.id
            LEFT JOIN incident_areas ia ON t.incident_area_id = ia.id
            LEFT JOIN users u1 ON t.created_by_user_id = u1.id
            LEFT JOIN users u2 ON t.assigned_technician_id = u2.id
            WHERE t.id = ?
        `;

        try {
            const result = await query(sql, [id]);
            return result[0] ? this._normalizeTicket(result[0]) : null;
        } catch (error) {
            throw error;
        }
    }

    static async findAll(filters = {}) {
        let sql = `
            SELECT 
                t.*,
                c.name as category_name,
                p.name as priority_name,
                p.color as priority_color,
                p.level as priority_level,
                e.name as state_name,
                e.color as state_color,
                ia.name as incident_area_name,
                u1.full_name as created_by_user_name,
                u1.email as created_by_user_email,
                u2.full_name as assigned_technician_name,
                u2.email as assigned_technician_email
            FROM tickets t
            LEFT JOIN ticket_categories c ON t.category_id = c.id
            LEFT JOIN ticket_priorities p ON t.priority_id = p.id
            LEFT JOIN ticket_states e ON t.state_id = e.id
            LEFT JOIN incident_areas ia ON t.incident_area_id = ia.id
            LEFT JOIN users u1 ON t.created_by_user_id = u1.id
            LEFT JOIN users u2 ON t.assigned_technician_id = u2.id
            WHERE 1=1
        `;
        
        try {
            const results = await this._executeFindAll(sql, filters, false);
            return results.map(ticket => this._normalizeTicket(ticket));
        } catch (error) {
            throw error;
        }
    }

    static _normalizeTicket(ticket, fromOldColumns) {
        if (!ticket) return ticket;
        return ticket;
    }

    static async _executeFindAll(sql, filters) {
        const params = [];

        if (filters.created_by_user_id) {
            sql += ' AND t.created_by_user_id = ?';
            params.push(filters.created_by_user_id);
        }

        if (filters.assigned_technician_id) {
            sql += ' AND t.assigned_technician_id = ?';
            params.push(filters.assigned_technician_id);
        }

        if (filters.state_id) {
            sql += ' AND t.state_id = ?';
            params.push(filters.state_id);
        }

        if (filters.category_id) {
            sql += ' AND t.category_id = ?';
            params.push(filters.category_id);
        }

        if (filters.priority_id) {
            sql += ' AND t.priority_id = ?';
            params.push(filters.priority_id);
        }

        if (filters.search) {
            sql += ' AND (t.title LIKE ? OR t.description LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }

        if (filters.date_from) {
            sql += ' AND DATE(t.created_at) >= ?';
            params.push(filters.date_from);
        }

        if (filters.date_to) {
            sql += ' AND DATE(t.created_at) <= ?';
            params.push(filters.date_to);
        }

        sql += ' ORDER BY t.created_at DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
            if (filters.offset) {
                sql += ' OFFSET ?';
                params.push(filters.offset);
            }
        }

        try {
            return await query(sql, params);
        } catch (error) {
            // Re-lanzar el error para que el método findAll lo capture
            throw error;
        }
    }

    static async update(id, data) {
        const {
            title,
            description,
            incident_area_id,
            category_id,
            priority_id,
            state_id,
            assigned_technician_id
        } = data;

        let updates = [];
        const params = [];
        let useOldColumns = false;

        if (title !== undefined) {
            updates.push('title = ?');
            params.push(title);
        }

        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }

        if (incident_area_id !== undefined) {
            updates.push('incident_area_id = ?');
            params.push(incident_area_id);
        }

        if (category_id !== undefined) {
            updates.push('category_id = ?');
            params.push(category_id);
        }

        if (priority_id !== undefined) {
            updates.push('priority_id = ?');
            params.push(priority_id);
        }

        if (state_id !== undefined) {
            updates.push('state_id = ?');
            params.push(state_id);
            
            if (state_id === 5) {
                updates.push('closed_at = NOW()');
            }
        }

        if (assigned_technician_id !== undefined) {
            updates.push('assigned_technician_id = ?');
            params.push(assigned_technician_id);
        }

        if (updates.length === 0) {
            return await this.findById(id);
        }

        params.push(id);
        let sql = `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`;

        await query(sql, params);

        return await this.findById(id);
    }

    static async delete(id) {
        const sql = 'DELETE FROM tickets WHERE id = ?';
        await query(sql, [id]);
        return true;
    }

    static async count(filters = {}) {
        let sql = 'SELECT COUNT(*) as total FROM tickets WHERE 1=1';
        const params = [];

        try {
            if (filters.created_by_user_id) {
                sql += ' AND created_by_user_id = ?';
                params.push(filters.created_by_user_id);
            }

            if (filters.assigned_technician_id) {
                sql += ' AND assigned_technician_id = ?';
                params.push(filters.assigned_technician_id);
            }

            if (filters.state_id) {
                sql += ' AND state_id = ?';
                params.push(filters.state_id);
            }

            if (filters.category_id) {
                sql += ' AND category_id = ?';
                params.push(filters.category_id);
            }

            if (filters.priority_id) {
                sql += ' AND priority_id = ?';
                params.push(filters.priority_id);
            }

            if (filters.search) {
                sql += ' AND (title LIKE ? OR description LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm);
            }

            if (filters.date_from) {
                sql += ' AND DATE(created_at) >= ?';
                params.push(filters.date_from);
            }

            if (filters.date_to) {
                sql += ' AND DATE(created_at) <= ?';
                params.push(filters.date_to);
            }

            const result = await query(sql, params);
            const rawTotal = result[0]?.total ?? 0;
            return typeof rawTotal === 'bigint' ? Number(rawTotal) : rawTotal;
        } catch (error) {
            throw error;
        }
    }

    static async getStats() {
        let sql = `
            SELECT 
                e.id as state_id,
                e.name as state_name,
                e.color as state_color,
                COUNT(t.id) as count
            FROM ticket_states e
            LEFT JOIN tickets t ON e.id = t.state_id
            WHERE e.active = TRUE
            GROUP BY e.id, e.name, e.color
            ORDER BY e.\`order\`
        `;

        return await query(sql);
    }

    static async getStatsByCategory() {
        let sql = `
            SELECT 
                c.id,
                c.name,
                COUNT(t.id) as count
            FROM ticket_categories c
            LEFT JOIN tickets t ON c.id = t.category_id
            WHERE c.active = TRUE
            GROUP BY c.id, c.name
            ORDER BY count DESC
        `;

        return await query(sql);
    }

    static async getStatsByPriority() {
        let sql = `
            SELECT 
                p.id,
                p.name,
                p.color,
                COUNT(t.id) as count
            FROM ticket_priorities p
            LEFT JOIN tickets t ON p.id = t.priority_id
            WHERE p.active = TRUE
            GROUP BY p.id, p.name, p.color
            ORDER BY p.level DESC
        `;

        return await query(sql);
    }
}

export default Ticket;
