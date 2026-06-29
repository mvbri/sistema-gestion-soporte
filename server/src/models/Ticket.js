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
            image_url,
            equipment_ids
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

            if (equipment_ids && Array.isArray(equipment_ids) && equipment_ids.length > 0) {
                try {
                    await this.setEquipment(ticketId, equipment_ids);
                } catch (error) {
                    console.warn('Error al asociar equipos al ticket:', error.message);
                }
            }
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
            if (!result[0]) return null;
            
            const ticket = this._normalizeTicket(result[0]);
            ticket.equipment = await this.getEquipment(id);
            return ticket;
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
            const tickets = results.map(ticket => this._normalizeTicket(ticket));
            
            for (const ticket of tickets) {
                ticket.equipment = await this.getEquipment(ticket.id);
            }
            
            return tickets;
        } catch (error) {
            throw error;
        }
    }

    static _normalizeTicket(ticket, fromOldColumns) {
        if (!ticket) return ticket;
        return {
            ...ticket,
            reopened: Boolean(ticket.reopened),
        };
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
            assigned_technician_id,
            equipment_ids
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

            if (state_id === 4) {
                updates.push('resolved_at = NOW()');
                updates.push('reopened = FALSE');
                updates.push('reopened_at = NULL');
            }
        }

        if (data.reopened !== undefined) {
            updates.push('reopened = ?');
            params.push(data.reopened ? 1 : 0);
        }

        if (data.reopened_at !== undefined) {
            if (data.reopened_at === null) {
                updates.push('reopened_at = NULL');
            } else {
                updates.push('reopened_at = ?');
                params.push(data.reopened_at);
            }
        }

        if (data.clear_resolved_at) {
            updates.push('resolved_at = NULL');
        }

        if (assigned_technician_id !== undefined) {
            updates.push('assigned_technician_id = ?');
            params.push(assigned_technician_id);
        }

        if (updates.length > 0) {
            params.push(id);
            let sql = `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`;
            await query(sql, params);
        }

        if (equipment_ids !== undefined) {
            try {
                await this.setEquipment(id, equipment_ids);
            } catch (error) {
                console.warn('Error al actualizar equipos del ticket:', error.message);
            }
        }

        return await this.findById(id);
    }

    /**
     * Cierra un ticket definitivamente con motivo de cierre en texto libre.
     * @param {string} id - UUID del ticket
     * @param {string} closureReason - Motivo obligatorio ingresado por el administrador
     */
    static async close(id, closureReason) {
        const sql = `
            UPDATE tickets
            SET state_id = 5,
                closed_at = NOW(),
                closure_reason = ?
            WHERE id = ?
        `;
        await query(sql, [closureReason.trim(), id]);
        return await this.findById(id);
    }

    /**
     * Reabre un ticket resuelto: pasa a En Proceso con flag reopened para badge en UI.
     */
    static async reopen(id) {
        const sql = `
            UPDATE tickets
            SET state_id = 3,
                reopened = TRUE,
                reopened_at = NOW(),
                resolved_at = NULL
            WHERE id = ?
        `;
        await query(sql, [id]);
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

    static async getStats(filters = {}) {
        const params = [];
        const dateFilters = [];
        if (filters.date_from) {
            dateFilters.push('DATE(t.created_at) >= ?');
            params.push(filters.date_from);
        }
        if (filters.date_to) {
            dateFilters.push('DATE(t.created_at) <= ?');
            params.push(filters.date_to);
        }
        const joinDateCondition = dateFilters.length > 0 ? ` AND ${dateFilters.join(' AND ')}` : '';

        let sql = `
            SELECT 
                e.id as state_id,
                e.name as state_name,
                e.color as state_color,
                COUNT(t.id) as count
            FROM ticket_states e
            LEFT JOIN tickets t ON e.id = t.state_id${joinDateCondition}
            WHERE e.active = TRUE
            GROUP BY e.id, e.name, e.color
            ORDER BY e.\`order\`
        `;

        return await query(sql, params);
    }

    static async getStatsByCategory(filters = {}) {
        const params = [];
        const dateFilters = [];
        if (filters.date_from) {
            dateFilters.push('DATE(t.created_at) >= ?');
            params.push(filters.date_from);
        }
        if (filters.date_to) {
            dateFilters.push('DATE(t.created_at) <= ?');
            params.push(filters.date_to);
        }
        const joinDateCondition = dateFilters.length > 0 ? ` AND ${dateFilters.join(' AND ')}` : '';

        let sql = `
            SELECT 
                c.id,
                c.name,
                COUNT(t.id) as count
            FROM ticket_categories c
            LEFT JOIN tickets t ON c.id = t.category_id${joinDateCondition}
            WHERE c.active = TRUE
            GROUP BY c.id, c.name
            ORDER BY count DESC
        `;

        return await query(sql, params);
    }

    static async getStatsByPriority(filters = {}) {
        const params = [];
        const dateFilters = [];
        if (filters.date_from) {
            dateFilters.push('DATE(t.created_at) >= ?');
            params.push(filters.date_from);
        }
        if (filters.date_to) {
            dateFilters.push('DATE(t.created_at) <= ?');
            params.push(filters.date_to);
        }
        const joinDateCondition = dateFilters.length > 0 ? ` AND ${dateFilters.join(' AND ')}` : '';

        let sql = `
            SELECT 
                p.id,
                p.name,
                p.color,
                COUNT(t.id) as count
            FROM ticket_priorities p
            LEFT JOIN tickets t ON p.id = t.priority_id${joinDateCondition}
            WHERE p.active = TRUE
            GROUP BY p.id, p.name, p.color
            ORDER BY p.level DESC
        `;

        return await query(sql, params);
    }

    static async getStatsByIncidentArea(filters = {}) {
        const params = [];
        const dateFilters = [];
        if (filters.date_from) {
            dateFilters.push('DATE(t.created_at) >= ?');
            params.push(filters.date_from);
        }
        if (filters.date_to) {
            dateFilters.push('DATE(t.created_at) <= ?');
            params.push(filters.date_to);
        }
        const joinDateCondition = dateFilters.length > 0 ? ` AND ${dateFilters.join(' AND ')}` : '';

        const sql = `
            SELECT 
                ia.id,
                ia.name,
                COUNT(t.id) as count
            FROM incident_areas ia
            LEFT JOIN tickets t ON ia.id = t.incident_area_id${joinDateCondition}
            WHERE ia.active = TRUE
            GROUP BY ia.id, ia.name
            ORDER BY count DESC
        `;

        return await query(sql, params);
    }

    static async getEquipment(ticketId) {
        const sql = `
            SELECT 
                e.id,
                e.name,
                e.brand,
                e.model,
                e.serial_number,
                e.type_id,
                et.name as type_name,
                e.status,
                e.location,
                e.assigned_to_user_id,
                u.full_name as assigned_to_user_name
            FROM ticket_equipment te
            INNER JOIN equipment e ON te.equipment_id = e.id
            LEFT JOIN equipment_types et ON e.type_id = et.id
            LEFT JOIN users u ON e.assigned_to_user_id = u.id
            WHERE te.ticket_id = ?
            ORDER BY e.name
        `;

        try {
            return await query(sql, [ticketId]);
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_FIELD_ERROR') {
                return [];
            }
            throw error;
        }
    }

    static async setEquipment(ticketId, equipmentIds) {
        try {
            const deleteSql = 'DELETE FROM ticket_equipment WHERE ticket_id = ?';
            await query(deleteSql, [ticketId]);

            if (equipmentIds && equipmentIds.length > 0) {
                const placeholders = equipmentIds.map(() => '(?, ?)').join(', ');
                const insertSql = `INSERT INTO ticket_equipment (ticket_id, equipment_id) VALUES ${placeholders}`;
                const values = equipmentIds.flatMap(eqId => [ticketId, eqId]);
                await query(insertSql, values);
            }
        } catch (error) {
            if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_FIELD_ERROR') {
                console.warn('Tabla ticket_equipment no existe. Ejecuta la migración migration_add_ticket_equipment.sql');
                return;
            }
            throw error;
        }
    }

    static toCount(raw) {
        return typeof raw === 'bigint' ? Number(raw) : raw ?? 0;
    }

    static toAvgHours(raw) {
        if (raw === null || raw === undefined) {
            return null;
        }
        return Number(Number(raw).toFixed(2));
    }

    /**
     * Métricas de resolución temporal (resolved_at) y cierre definitivo (closed_at)
     * en el rango [dateFrom, dateTo] inclusive (comparación DATE).
     */
    static async getLifecycleMetrics(dateFrom, dateTo) {
        const rangeParams = [dateFrom, dateTo];

        const resolvedTotalSql = `
            SELECT COUNT(*) as total
            FROM tickets t
            WHERE t.resolved_at IS NOT NULL
            AND DATE(t.resolved_at) >= ? AND DATE(t.resolved_at) <= ?
        `;

        const closedTotalSql = `
            SELECT COUNT(*) as total
            FROM tickets t
            WHERE t.closed_at IS NOT NULL
            AND DATE(t.closed_at) >= ? AND DATE(t.closed_at) <= ?
        `;

        const avgHoursToResolutionSql = `
            SELECT AVG(TIMESTAMPDIFF(HOUR, t.created_at, t.resolved_at)) as avg_hours
            FROM tickets t
            WHERE t.resolved_at IS NOT NULL
            AND DATE(t.resolved_at) >= ? AND DATE(t.resolved_at) <= ?
        `;

        const avgHoursToClosureSql = `
            SELECT AVG(TIMESTAMPDIFF(HOUR, t.created_at, t.closed_at)) as avg_hours
            FROM tickets t
            WHERE t.closed_at IS NOT NULL
            AND DATE(t.closed_at) >= ? AND DATE(t.closed_at) <= ?
        `;

        const resolvedByTechnicianSql = `
            SELECT u.id as technician_user_id, u.full_name as technician_name, COUNT(t.id) as count
            FROM tickets t
            INNER JOIN users u ON t.assigned_technician_id = u.id
            WHERE t.resolved_at IS NOT NULL
            AND DATE(t.resolved_at) >= ? AND DATE(t.resolved_at) <= ?
            GROUP BY u.id, u.full_name
            ORDER BY count DESC
        `;

        const closedByTechnicianSql = `
            SELECT u.id as technician_user_id, u.full_name as technician_name, COUNT(t.id) as count
            FROM tickets t
            INNER JOIN users u ON t.assigned_technician_id = u.id
            WHERE t.closed_at IS NOT NULL
            AND DATE(t.closed_at) >= ? AND DATE(t.closed_at) <= ?
            GROUP BY u.id, u.full_name
            ORDER BY count DESC
        `;

        const [
            resolvedTotalRows,
            closedTotalRows,
            avgHoursToResolutionRows,
            avgHoursToClosureRows,
            resolvedByTechnician,
            closedByTechnician
        ] = await Promise.all([
            query(resolvedTotalSql, rangeParams),
            query(closedTotalSql, rangeParams),
            query(avgHoursToResolutionSql, rangeParams),
            query(avgHoursToClosureSql, rangeParams),
            query(resolvedByTechnicianSql, rangeParams),
            query(closedByTechnicianSql, rangeParams)
        ]);

        return {
            tickets_resolved_total: this.toCount(resolvedTotalRows[0]?.total),
            tickets_closed_total: this.toCount(closedTotalRows[0]?.total),
            avg_hours_to_resolution: this.toAvgHours(avgHoursToResolutionRows[0]?.avg_hours),
            avg_hours_to_closure: this.toAvgHours(avgHoursToClosureRows[0]?.avg_hours),
            resolved_by_technician: resolvedByTechnician,
            closed_by_technician: closedByTechnician
        };
    }

    /**
     * Aggregates for tickets created in [dateFrom, dateTo] (inclusive, DATE comparison)
     * plus lifecycle metrics (resolved_at vs closed_at) for the same calendar range.
     */
    static async getPeriodReport(dateFrom, dateTo) {
        const rangeParams = [dateFrom, dateTo];

        const createdTotalSql = `
            SELECT COUNT(*) as total
            FROM tickets t
            WHERE DATE(t.created_at) >= ? AND DATE(t.created_at) <= ?
        `;

        const byStateSql = `
            SELECT
                e.id as state_id,
                e.name as state_name,
                e.color as state_color,
                COUNT(t.id) as count
            FROM ticket_states e
            LEFT JOIN tickets t ON e.id = t.state_id
                AND DATE(t.created_at) >= ? AND DATE(t.created_at) <= ?
            WHERE e.active = TRUE
            GROUP BY e.id, e.name, e.color
            ORDER BY e.\`order\`
        `;

        const byCategorySql = `
            SELECT c.id, c.name, COUNT(t.id) as count
            FROM ticket_categories c
            LEFT JOIN tickets t ON c.id = t.category_id
                AND DATE(t.created_at) >= ? AND DATE(t.created_at) <= ?
            WHERE c.active = TRUE
            GROUP BY c.id, c.name
            ORDER BY count DESC
        `;

        const byPrioritySql = `
            SELECT p.id, p.name, p.color, COUNT(t.id) as count
            FROM ticket_priorities p
            LEFT JOIN tickets t ON p.id = t.priority_id
                AND DATE(t.created_at) >= ? AND DATE(t.created_at) <= ?
            WHERE p.active = TRUE
            GROUP BY p.id, p.name, p.color
            ORDER BY p.level DESC
        `;

        const byIncidentAreaSql = `
            SELECT ia.id, ia.name, COUNT(t.id) as count
            FROM incident_areas ia
            LEFT JOIN tickets t ON ia.id = t.incident_area_id
                AND DATE(t.created_at) >= ? AND DATE(t.created_at) <= ?
            WHERE ia.active = TRUE
            GROUP BY ia.id, ia.name
            ORDER BY count DESC
        `;

        const [
            createdTotalRows,
            lifecycle,
            byState,
            byCategory,
            byPriority,
            byIncidentArea
        ] = await Promise.all([
            query(createdTotalSql, rangeParams),
            this.getLifecycleMetrics(dateFrom, dateTo),
            query(byStateSql, rangeParams),
            query(byCategorySql, rangeParams),
            query(byPrioritySql, rangeParams),
            query(byIncidentAreaSql, rangeParams)
        ]);

        return {
            tickets_created_total: this.toCount(createdTotalRows[0]?.total),
            ...lifecycle,
            by_state: byState,
            by_category: byCategory,
            by_priority: byPriority,
            by_incident_area: byIncidentArea
        };
    }
}

export default Ticket;
