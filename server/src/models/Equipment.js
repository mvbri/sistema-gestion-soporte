import { query } from '../config/database.js';

class Equipment {
    static async create(data) {
        const {
            name,
            brand,
            model,
            serial_number,
            type_id,
            type,
            status,
            location,
            assigned_to_user_id,
            description,
            purchase_date,
            warranty_expires_at
        } = data;

        let finalTypeId = type_id;
        if (!finalTypeId && type) {
            const typeResult = await query('SELECT id FROM equipment_types WHERE name = ? AND active = TRUE', [type]);
            if (typeResult.length > 0) {
                finalTypeId = typeResult[0].id;
            }
        }

        if (!finalTypeId) {
            const defaultType = await query('SELECT id FROM equipment_types WHERE name = ? AND active = TRUE', ['Otro']);
            finalTypeId = defaultType.length > 0 ? defaultType[0].id : null;
        }

        if (!finalTypeId) {
            throw new Error('No se pudo determinar el tipo de equipo');
        }

        const sql = `
            INSERT INTO equipment (
                name, brand, model, serial_number, type_id, status,
                location, assigned_to_user_id, description,
                purchase_date, warranty_expires_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        try {
            const result = await query(sql, [
                name,
                brand || null,
                model || null,
                serial_number || null,
                finalTypeId,
                status || 'available',
                location || null,
                assigned_to_user_id || null,
                description || null,
                purchase_date || null,
                warranty_expires_at || null
            ]);

            return await this.findById(result.insertId);
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        const sql = `
            SELECT 
                e.*,
                et.name as type_name,
                et.description as type_description,
                u.full_name as assigned_to_user_name,
                u.email as assigned_to_user_email
            FROM equipment e
            LEFT JOIN equipment_types et ON e.type_id = et.id
            LEFT JOIN users u ON e.assigned_to_user_id = u.id
            WHERE e.id = ? AND e.active = TRUE
        `;

        try {
            const result = await query(sql, [id]);
            if (result[0]) {
                return {
                    ...result[0],
                    type: result[0].type_name || null
                };
            }
            return null;
        } catch (error) {
            throw error;
        }
    }

    static async findAll(filters = {}) {
        let sql = `
            SELECT 
                e.*,
                et.name as type_name,
                et.description as type_description,
                u.full_name as assigned_to_user_name,
                u.email as assigned_to_user_email
            FROM equipment e
            LEFT JOIN equipment_types et ON e.type_id = et.id
            LEFT JOIN users u ON e.assigned_to_user_id = u.id
            WHERE e.active = TRUE
        `;

        try {
            const results = await this._executeFindAll(sql, filters);
            return results.map(item => ({
                ...item,
                type: item.type_name || null
            }));
        } catch (error) {
            throw error;
        }
    }

    static async _executeFindAll(sql, filters) {
        const params = [];

        if (filters.status) {
            sql += ' AND e.status = ?';
            params.push(filters.status);
        }

        if (filters.type) {
            if (typeof filters.type === 'number') {
                sql += ' AND e.type_id = ?';
                params.push(filters.type);
            } else {
                sql += ' AND et.name = ?';
                params.push(filters.type);
            }
        }

        if (filters.assigned_to_user_id) {
            sql += ' AND e.assigned_to_user_id = ?';
            params.push(filters.assigned_to_user_id);
        }

        if (filters.search) {
            sql += ' AND (e.name LIKE ? OR e.brand LIKE ? OR e.model LIKE ? OR e.serial_number LIKE ? OR et.name LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        sql += ' ORDER BY e.created_at DESC';

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
            throw error;
        }
    }

    static async update(id, data) {
        const {
            name,
            brand,
            model,
            serial_number,
            type,
            status,
            location,
            assigned_to_user_id,
            description,
            purchase_date,
            warranty_expires_at
        } = data;

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }

        if (brand !== undefined) {
            updates.push('brand = ?');
            params.push(brand);
        }

        if (model !== undefined) {
            updates.push('model = ?');
            params.push(model);
        }

        if (serial_number !== undefined) {
            updates.push('serial_number = ?');
            params.push(serial_number);
        }

        if (type_id !== undefined) {
            updates.push('type_id = ?');
            params.push(type_id);
        } else if (type !== undefined) {
            const typeResult = await query('SELECT id FROM equipment_types WHERE name = ? AND active = TRUE', [type]);
            if (typeResult.length > 0) {
                updates.push('type_id = ?');
                params.push(typeResult[0].id);
            }
        }

        if (status !== undefined) {
            updates.push('status = ?');
            params.push(status);
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

        if (purchase_date !== undefined) {
            updates.push('purchase_date = ?');
            params.push(purchase_date);
        }

        if (warranty_expires_at !== undefined) {
            updates.push('warranty_expires_at = ?');
            params.push(warranty_expires_at);
        }

        if (updates.length === 0) {
            return await this.findById(id);
        }

        params.push(id);
        const sql = `UPDATE equipment SET ${updates.join(', ')} WHERE id = ? AND active = TRUE`;

        await query(sql, params);

        return await this.findById(id);
    }

    static async delete(id) {
        const sql = 'UPDATE equipment SET active = FALSE WHERE id = ?';
        await query(sql, [id]);
        return true;
    }

    static async count(filters = {}) {
        let sql = 'SELECT COUNT(*) as total FROM equipment WHERE active = TRUE';
        const params = [];

        try {
            if (filters.status) {
                sql += ' AND status = ?';
                params.push(filters.status);
            }

            if (filters.type) {
                if (typeof filters.type === 'number') {
                    sql += ' AND type_id = ?';
                    params.push(filters.type);
                } else {
                    sql += ' AND type_id IN (SELECT id FROM equipment_types WHERE name = ? AND active = TRUE)';
                    params.push(filters.type);
                }
            }

            if (filters.assigned_to_user_id) {
                sql += ' AND assigned_to_user_id = ?';
                params.push(filters.assigned_to_user_id);
            }

            if (filters.search) {
                sql += ' AND (name LIKE ? OR brand LIKE ? OR model LIKE ? OR serial_number LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            const result = await query(sql, params);
            const rawTotal = result[0]?.total ?? 0;
            return typeof rawTotal === 'bigint' ? Number(rawTotal) : rawTotal;
        } catch (error) {
            throw error;
        }
    }

    static async getStats() {
        const sql = `
            SELECT 
                status,
                COUNT(*) as count
            FROM equipment
            WHERE active = TRUE
            GROUP BY status
            ORDER BY status
        `;

        return await query(sql);
    }

    static async getStatsByType() {
        const sql = `
            SELECT 
                et.name as type,
                COUNT(*) as count
            FROM equipment e
            LEFT JOIN equipment_types et ON e.type_id = et.id
            WHERE e.active = TRUE
            GROUP BY et.id, et.name
            ORDER BY et.name
        `;

        return await query(sql);
    }

    static async assignToUser(equipmentId, userId) {
        const sql = `
            UPDATE equipment 
            SET assigned_to_user_id = ?, status = 'assigned'
            WHERE id = ? AND active = TRUE
        `;
        await query(sql, [userId, equipmentId]);
        return await this.findById(equipmentId);
    }

    static async unassign(equipmentId) {
        const sql = `
            UPDATE equipment 
            SET assigned_to_user_id = NULL, status = 'available'
            WHERE id = ? AND active = TRUE
        `;
        await query(sql, [equipmentId]);
        return await this.findById(equipmentId);
    }
}

export default Equipment;
