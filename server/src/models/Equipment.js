import { query } from '../config/database.js';

class Equipment {
    /** Loan statuses that reserve concrete equipment units (matches EquipmentLoan validation). */
    static ACTIVE_LOAN_STATUSES = ['approved', 'delivered', 'overdue'];

    /** Excludes equipment reserved in an active loan (matches EquipmentLoan create validation). */
    static _sqlExcludeActiveLoans(equipmentIdExpr) {
        return ` AND NOT EXISTS (
            SELECT 1
            FROM equipment_loan_items eli
            INNER JOIN equipment_loans el ON el.id = eli.loan_id
            WHERE eli.equipment_id = ${equipmentIdExpr}
              AND eli.active = TRUE
              AND el.active = TRUE
              AND el.status IN ('approved', 'delivered', 'overdue')
        )`;
    }

    static _activeLoanStatusesInSql() {
        return Equipment.ACTIVE_LOAN_STATUSES.map((s) => `'${s}'`).join(', ');
    }

    static _sqlActiveLoanField(fieldExpr, equipmentIdExpr) {
        return `(SELECT ${fieldExpr}
            FROM equipment_loan_items eli
            INNER JOIN equipment_loans el ON el.id = eli.loan_id
            INNER JOIN users requester ON requester.id = el.requester_user_id
            WHERE eli.equipment_id = ${equipmentIdExpr}
              AND eli.active = TRUE
              AND el.active = TRUE
              AND el.status IN ('approved', 'delivered', 'overdue')
            ORDER BY el.created_at DESC, el.id DESC
            LIMIT 1)`;
    }

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
                u.email as assigned_to_user_email,
                ${this._sqlActiveLoanField('el.id', 'e.id')} as active_loan_id,
                ${this._sqlActiveLoanField('el.status', 'e.id')} as active_loan_status,
                ${this._sqlActiveLoanField('requester.full_name', 'e.id')} as active_loan_requester_name
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
                u.email as assigned_to_user_email,
                ${this._sqlActiveLoanField('el.id', 'e.id')} as active_loan_id,
                ${this._sqlActiveLoanField('el.status', 'e.id')} as active_loan_status,
                ${this._sqlActiveLoanField('requester.full_name', 'e.id')} as active_loan_requester_name
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
        const ticketSelection =
            filters.for_ticket_selection === true && filters.ticket_user_id != null;
        const loanSelection = filters.for_loan_selection === true;

        if (ticketSelection) {
            sql += ' AND (e.status = ? OR e.assigned_to_user_id = ?)';
            params.push('available', filters.ticket_user_id);
        } else if (loanSelection) {
            sql += ' AND e.status = ?';
            params.push(filters.status || 'available');
            sql += this._sqlExcludeActiveLoans('e.id');
        } else {
            if (filters.status) {
                sql += ' AND e.status = ?';
                params.push(filters.status);
            }

            if (filters.assigned_to_user_id) {
                sql += ' AND e.assigned_to_user_id = ?';
                params.push(filters.assigned_to_user_id);
            }
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
            type_id,
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
        const ticketSelection =
            filters.for_ticket_selection === true && filters.ticket_user_id != null;
        const loanSelection = filters.for_loan_selection === true;

        try {
            if (ticketSelection) {
                sql += ' AND (status = ? OR assigned_to_user_id = ?)';
                params.push('available', filters.ticket_user_id);
            } else if (loanSelection) {
                sql += ' AND status = ?';
                params.push(filters.status || 'available');
                sql += this._sqlExcludeActiveLoans('equipment.id');
            } else {
                if (filters.status) {
                    sql += ' AND status = ?';
                    params.push(filters.status);
                }

                if (filters.assigned_to_user_id) {
                    sql += ' AND assigned_to_user_id = ?';
                    params.push(filters.assigned_to_user_id);
                }
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

    static async getActiveLoanForEquipment(equipmentId, conn = null) {
        const runner = conn ? (sql, params) => conn.query(sql, params) : query;
        const rows = await runner(
            `SELECT el.id AS loan_id, el.status, el.requester_user_id, u.full_name AS requester_name
             FROM equipment_loan_items eli
             INNER JOIN equipment_loans el ON el.id = eli.loan_id
             INNER JOIN users u ON u.id = el.requester_user_id
             WHERE eli.equipment_id = ?
               AND eli.active = TRUE
               AND el.active = TRUE
               AND el.status IN (${this._activeLoanStatusesInSql()})
             ORDER BY el.created_at DESC, el.id DESC
             LIMIT 1`,
            [equipmentId]
        );
        return rows[0] ?? null;
    }

    /**
     * Aligns equipment.status / assigned_to_user_id with active loan reservations.
     * @returns {Promise<number>} rows updated
     */
    static async syncActiveLoanAssignments(conn = null) {
        const runner = conn ? (sql, params) => conn.query(sql, params) : query;
        const result = await runner(
            `UPDATE equipment e
             INNER JOIN (
                 SELECT eli.equipment_id, el.requester_user_id
                 FROM equipment_loan_items eli
                 INNER JOIN equipment_loans el ON el.id = eli.loan_id
                 WHERE eli.active = TRUE
                   AND el.active = TRUE
                   AND el.status IN (${this._activeLoanStatusesInSql()})
                   AND eli.equipment_id IS NOT NULL
             ) active ON active.equipment_id = e.id
             SET e.status = 'assigned',
                 e.assigned_to_user_id = active.requester_user_id
             WHERE e.active = TRUE
               AND (
                   e.status <> 'assigned'
                   OR e.assigned_to_user_id IS NULL
                   OR e.assigned_to_user_id <> active.requester_user_id
               )`
        );
        return Number(result?.affectedRows ?? result?.[0]?.affectedRows ?? 0);
    }

    /** Reserves all concrete equipment items on a loan for the requester. */
    static async reserveForLoan(conn, loanId) {
        await conn.query(
            `UPDATE equipment e
             INNER JOIN equipment_loan_items eli
               ON eli.equipment_id = e.id
              AND eli.loan_id = ?
              AND eli.active = TRUE
              AND eli.equipment_id IS NOT NULL
             INNER JOIN equipment_loans el ON el.id = eli.loan_id AND el.active = TRUE
             SET e.status = 'assigned',
                 e.assigned_to_user_id = el.requester_user_id
             WHERE e.active = TRUE`,
            [loanId]
        );
    }

    static async assignToUser(equipmentId, userId) {
        const activeLoan = await this.getActiveLoanForEquipment(equipmentId);
        if (activeLoan) {
            throw new Error(
                'No se puede reasignar manualmente: el equipo tiene un préstamo activo. ' +
                    'Cancele o devuelva el préstamo primero.'
            );
        }

        const sql = `
            UPDATE equipment 
            SET assigned_to_user_id = ?, status = 'assigned'
            WHERE id = ? AND active = TRUE
        `;
        await query(sql, [userId, equipmentId]);
        return await this.findById(equipmentId);
    }

    static async unassign(equipmentId) {
        const activeLoan = await this.getActiveLoanForEquipment(equipmentId);
        if (activeLoan) {
            throw new Error(
                'No se puede desasignar: el equipo está reservado por un préstamo activo. ' +
                    'Registre la devolución o cancele el préstamo.'
            );
        }

        const sql = `
            UPDATE equipment 
            SET assigned_to_user_id = NULL, status = 'available'
            WHERE id = ? AND active = TRUE
        `;
        await query(sql, [equipmentId]);
        return await this.findById(equipmentId);
    }

    static assertUpdateAllowedWithActiveLoan(activeLoan, updateData) {
        if (!activeLoan) {
            return;
        }

        const clearsAssignee =
            updateData.assigned_to_user_id === null ||
            (updateData.assigned_to_user_id === undefined && updateData.status === 'available');

        const changesAssignee =
            updateData.assigned_to_user_id !== undefined &&
            updateData.assigned_to_user_id !== null &&
            Number(updateData.assigned_to_user_id) !== Number(activeLoan.requester_user_id);

        const setsAvailable = updateData.status === 'available';

        if (clearsAssignee || changesAssignee || setsAvailable) {
            throw new Error(
                'No se puede modificar la asignación ni dejar el equipo disponible mientras tenga un préstamo activo.'
            );
        }
    }
}

export default Equipment;
