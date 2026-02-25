import { query } from '../config/database.js';

class Tool {
    static async create(data) {
        const {
            name,
            code,
            type_id,
            type,
            status,
            condition,
            location,
            assigned_to_user_id,
            description
        } = data;

        let finalTypeId = type_id;
        if (!finalTypeId && type) {
            const typeResult = await query('SELECT id FROM tool_types WHERE name = ? AND active = TRUE', [type]);
            if (typeResult.length > 0) {
                finalTypeId = typeResult[0].id;
            }
        }

        if (!finalTypeId) {
            const defaultType = await query('SELECT id FROM tool_types WHERE name = ? AND active = TRUE', ['Other']);
            finalTypeId = defaultType.length > 0 ? defaultType[0].id : null;
        }

        if (!finalTypeId) {
            throw new Error('No se pudo determinar el tipo de herramienta');
        }

        const sql = `
            INSERT INTO tools (
                name,
                code,
                type_id,
                status,
                condition,
                location,
                assigned_to_user_id,
                description
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await query(sql, [
            name,
            code || null,
            finalTypeId,
            status || (assigned_to_user_id ? 'assigned' : 'available'),
            condition || 'good',
            location || null,
            assigned_to_user_id || null,
            description || null
        ]);

        return this.findById(result.insertId);
    }

    static async findById(id) {
        const sql = `
            SELECT 
                t.*,
                tt.name as type_name,
                tt.description as type_description,
                u.full_name as assigned_to_user_name,
                u.email as assigned_to_user_email
            FROM tools t
            LEFT JOIN tool_types tt ON t.type_id = tt.id
            LEFT JOIN users u ON t.assigned_to_user_id = u.id
            WHERE t.id = ? AND t.active = TRUE
        `;

        const result = await query(sql, [id]);
        if (result[0]) {
            return {
                ...result[0],
                type: result[0].type_name || null
            };
        }
        return null;
    }

    static async findAll(filters = {}) {
        let sql = `
            SELECT 
                t.*,
                tt.name as type_name,
                tt.description as type_description,
                u.full_name as assigned_to_user_name,
                u.email as assigned_to_user_email
            FROM tools t
            LEFT JOIN tool_types tt ON t.type_id = tt.id
            LEFT JOIN users u ON t.assigned_to_user_id = u.id
            WHERE t.active = TRUE
        `;

        const params = [];

        if (filters.status) {
            sql += ' AND t.status = ?';
            params.push(filters.status);
        }

        if (filters.type) {
            if (typeof filters.type === 'number') {
                sql += ' AND t.type_id = ?';
                params.push(filters.type);
            } else {
                sql += ' AND tt.name = ?';
                params.push(filters.type);
            }
        }

        if (filters.assigned_to_user_id) {
            sql += ' AND t.assigned_to_user_id = ?';
            params.push(filters.assigned_to_user_id);
        }

        if (filters.search) {
            sql += ' AND (t.name LIKE ? OR t.code LIKE ? OR t.location LIKE ? OR tt.name LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
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

        const results = await query(sql, params);
        return results.map(item => ({
            ...item,
            type: item.type_name || null
        }));
    }

    static async update(id, data) {
        const {
            name,
            code,
            type_id,
            type,
            status,
            condition,
            location,
            assigned_to_user_id,
            description
        } = data;

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }

        if (code !== undefined) {
            updates.push('code = ?');
            params.push(code);
        }

        if (type_id !== undefined) {
            updates.push('type_id = ?');
            params.push(type_id);
        } else if (type !== undefined) {
            const typeResult = await query('SELECT id FROM tool_types WHERE name = ? AND active = TRUE', [type]);
            if (typeResult.length > 0) {
                updates.push('type_id = ?');
                params.push(typeResult[0].id);
            }
        }

        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }

        if (condition !== undefined) {
            updates.push('condition = ?');
            params.push(condition);
        }

        if (location !== undefined) {
            updates.push('location = ?');
            params.push(location);
        }

        if (assigned_to_user_id !== undefined) {
            updates.push('assigned_to_user_id = ?');
            params.push(assigned_to_user_id);
        }

        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        params.push(id);
        const sql = `UPDATE tools SET ${updates.join(', ')} WHERE id = ? AND active = TRUE`;

        await query(sql, params);

        return this.findById(id);
    }

    static async delete(id) {
        const sql = 'UPDATE tools SET active = FALSE WHERE id = ?';
        await query(sql, [id]);
        return true;
    }

    static async count(filters = {}) {
        let sql = 'SELECT COUNT(*) as total FROM tools WHERE active = TRUE';
        const params = [];

        if (filters.status) {
            sql += ' AND status = ?';
            params.push(filters.status);
        }

        if (filters.type) {
            if (typeof filters.type === 'number') {
                sql += ' AND type_id = ?';
                params.push(filters.type);
            } else {
                sql += ' AND type_id IN (SELECT id FROM tool_types WHERE name = ? AND active = TRUE)';
                params.push(filters.type);
            }
        }

        if (filters.assigned_to_user_id) {
            sql += ' AND assigned_to_user_id = ?';
            params.push(filters.assigned_to_user_id);
        }

        if (filters.search) {
            sql += ' AND (name LIKE ? OR code LIKE ? OR location LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        const result = await query(sql, params);
        const rawTotal = result[0]?.total ?? 0;
        return typeof rawTotal === 'bigint' ? Number(rawTotal) : rawTotal;
    }

    static async getStats() {
        const sql = `
            SELECT 
                status,
                COUNT(*) as count
            FROM tools
            WHERE active = TRUE
            GROUP BY status
            ORDER BY status
        `;

        return query(sql);
    }

    static async getStatsByType() {
        const sql = `
            SELECT 
                tt.name as type,
                COUNT(*) as count
            FROM tools t
            LEFT JOIN tool_types tt ON t.type_id = tt.id
            WHERE t.active = TRUE
            GROUP BY tt.id, tt.name
            ORDER BY tt.name
        `;

        return query(sql);
    }

    static async assignToUser(toolId, userId) {
        const sql = `
            UPDATE tools 
            SET assigned_to_user_id = ?, status = 'assigned'
            WHERE id = ? AND active = TRUE
        `;
        await query(sql, [userId, toolId]);
        return this.findById(toolId);
    }

    static async unassign(toolId) {
        const sql = `
            UPDATE tools 
            SET assigned_to_user_id = NULL, status = 'available'
            WHERE id = ? AND active = TRUE
        `;
        await query(sql, [toolId]);
        return this.findById(toolId);
    }
}

export default Tool;

