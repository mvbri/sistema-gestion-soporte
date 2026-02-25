import { query } from '../config/database.js';

class Consumable {
    static async create(data) {
        const {
            name,
            type_id,
            unit,
            quantity,
            minimum_quantity,
            status,
            location,
            description
        } = data;

        const sql = `
            INSERT INTO consumables (
                name,
                type_id,
                unit,
                quantity,
                minimum_quantity,
                status,
                location,
                description
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const result = await query(sql, [
            name,
            type_id,
            unit,
            quantity ?? 0,
            minimum_quantity ?? 0,
            status || 'available',
            location || null,
            description || null
        ]);

        return this.findById(result.insertId);
    }

    static async findById(id) {
        const sql = `
            SELECT 
                c.*,
                ct.name as type_name,
                ct.description as type_description
            FROM consumables c
            LEFT JOIN consumable_types ct ON c.type_id = ct.id
            WHERE c.id = ? AND c.active = TRUE
        `;

        const result = await query(sql, [id]);
        return result[0] || null;
    }

    static async findAll(filters = {}) {
        let sql = `
            SELECT 
                c.*,
                ct.name as type_name,
                ct.description as type_description
            FROM consumables c
            LEFT JOIN consumable_types ct ON c.type_id = ct.id
            WHERE c.active = TRUE
        `;

        const params = [];

        if (filters.status) {
            sql += ' AND c.status = ?';
            params.push(filters.status);
        }

        if (filters.type) {
            if (typeof filters.type === 'number') {
                sql += ' AND c.type_id = ?';
                params.push(filters.type);
            } else {
                sql += ' AND ct.name = ?';
                params.push(filters.type);
            }
        }

        if (filters.search) {
            sql += ' AND (c.name LIKE ? OR c.unit LIKE ? OR ct.name LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters.below_minimum) {
            sql += ' AND c.quantity <= c.minimum_quantity';
        }

        sql += ' ORDER BY c.created_at DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
            if (filters.offset) {
                sql += ' OFFSET ?';
                params.push(filters.offset);
            }
        }

        return query(sql, params);
    }

    static async update(id, data) {
        const {
            name,
            type_id,
            unit,
            quantity,
            minimum_quantity,
            status,
            location,
            description
        } = data;

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }

        if (type_id !== undefined) {
            updates.push('type_id = ?');
            params.push(type_id);
        }

        if (unit !== undefined) {
            updates.push('unit = ?');
            params.push(unit);
        }

        if (quantity !== undefined) {
            updates.push('quantity = ?');
            params.push(quantity);
        }

        if (minimum_quantity !== undefined) {
            updates.push('minimum_quantity = ?');
            params.push(minimum_quantity);
        }

        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
        }

        if (location !== undefined) {
            updates.push('location = ?');
            params.push(location);
        }

        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        params.push(id);

        const sql = `
            UPDATE consumables
            SET ${updates.join(', ')}
            WHERE id = ? AND active = TRUE
        `;

        await query(sql, params);

        return this.findById(id);
    }

    static async delete(id) {
        const sql = 'UPDATE consumables SET active = FALSE WHERE id = ?';
        await query(sql, [id]);
        return true;
    }

    static async count(filters = {}) {
        let sql = 'SELECT COUNT(*) as total FROM consumables WHERE active = TRUE';
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
                sql += ' AND type_id IN (SELECT id FROM consumable_types WHERE name = ? AND active = TRUE)';
                params.push(filters.type);
            }
        }

        if (filters.search) {
            sql += ' AND (name LIKE ? OR unit LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }

        if (filters.below_minimum) {
            sql += ' AND quantity <= minimum_quantity';
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
            FROM consumables
            WHERE active = TRUE
            GROUP BY status
            ORDER BY status
        `;

        return query(sql);
    }

    static async getStatsByType() {
        const sql = `
            SELECT 
                ct.name as type,
                COUNT(*) as count
            FROM consumables c
            LEFT JOIN consumable_types ct ON c.type_id = ct.id
            WHERE c.active = TRUE
            GROUP BY ct.id, ct.name
            ORDER BY ct.name
        `;

        return query(sql);
    }
}

export default Consumable;

