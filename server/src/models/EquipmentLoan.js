import { getConnection, query } from '../config/database.js';

class EquipmentLoan {
    static allowedEquipmentStatuses = ['available', 'assigned', 'maintenance', 'retired'];

    static async create(data) {
        const {
            requester_user_id,
            target_incident_area_id,
            request_notes,
            start_date,
            expected_return_date,
            items
        } = data;

        const conn = await getConnection();
        try {
            await conn.beginTransaction();

            const incidentAreaResult = await conn.query(
                `SELECT id, active
                 FROM incident_areas
                 WHERE id = ?
                 LIMIT 1`,
                [target_incident_area_id]
            );
            const incidentArea = incidentAreaResult[0];
            if (!incidentArea || !incidentArea.active) {
                throw new Error('El área destino seleccionada no existe o está inactiva');
            }

            const loanResult = await conn.query(
                `INSERT INTO equipment_loans (
                    requester_user_id,
                    target_incident_area_id,
                    request_notes,
                    start_date,
                    expected_return_date
                ) VALUES (?, ?, ?, ?, ?)`,
                [
                    requester_user_id,
                    target_incident_area_id || null,
                    request_notes || null,
                    start_date,
                    expected_return_date
                ]
            );

            const loanId = loanResult.insertId;

            for (const item of items) {
                await this._validateLoanItemAvailability(conn, item);
                await conn.query(
                    `INSERT INTO equipment_loan_items (loan_id, equipment_id, pool_id, quantity)
                     VALUES (?, ?, ?, ?)`,
                    [loanId, item.equipment_id || null, item.pool_id || null, item.quantity || 1]
                );
            }

            await conn.query(
                `INSERT INTO equipment_loan_history (loan_id, changed_by_user_id, previous_status, new_status, notes)
                 VALUES (?, ?, NULL, 'pending', ?)`,
                [loanId, requester_user_id, 'Solicitud creada']
            );

            await conn.commit();
            return await this.findById(loanId);
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    static async _validateLoanItemAvailability(conn, item) {
        if (item.pool_id) {
            throw new Error('Las solicitudes por pool están deshabilitadas');
        }
        if (!item.equipment_id) {
            throw new Error('Cada ítem debe incluir un equipo');
        }
        const equipmentResult = await conn.query(
            `SELECT id, status, active
             FROM equipment
             WHERE id = ?
             LIMIT 1`,
            [item.equipment_id]
        );
        const equipment = equipmentResult[0];
        if (!equipment || !equipment.active) {
            throw new Error(`El equipo ${item.equipment_id} no existe o está inactivo`);
        }
        if (equipment.status !== 'available') {
            throw new Error(`El equipo ${item.equipment_id} no está disponible para préstamo`);
        }

        const overlap = await conn.query(
            `SELECT eli.id
             FROM equipment_loan_items eli
             INNER JOIN equipment_loans el ON el.id = eli.loan_id
             WHERE eli.equipment_id = ?
               AND eli.active = TRUE
               AND el.active = TRUE
               AND el.status IN ('approved', 'delivered', 'overdue')
             LIMIT 1`,
            [item.equipment_id]
        );
        if (overlap.length > 0) {
            throw new Error(`El equipo ${item.equipment_id} ya se encuentra prestado o reservado`);
        }
    }

    /** Devuelve al pool de inventario los equipos concretos del préstamo (available, sin asignatario). */
    static async _releaseLoanEquipmentItems(conn, loanId) {
        const rows = await conn.query(
            `SELECT equipment_id
             FROM equipment_loan_items
             WHERE loan_id = ?
               AND active = TRUE
               AND equipment_id IS NOT NULL`,
            [loanId]
        );
        for (const row of rows) {
            await conn.query(
                `UPDATE equipment
                 SET status = 'available', assigned_to_user_id = NULL
                 WHERE id = ?`,
                [row.equipment_id]
            );
        }
    }

    static async findById(loanId) {
        const loanRows = await query(
            `SELECT
                el.*,
                CONCAT('SOL-', YEAR(el.created_at), '-', LPAD(el.id, 4, '0')) AS request_code,
                requester.full_name AS requester_name,
                requester.email AS requester_email,
                ia.name AS target_incident_area_name,
                approver.full_name AS approver_name,
                deliverer.full_name AS deliverer_name,
                returner.full_name AS returner_name
             FROM equipment_loans el
             INNER JOIN users requester ON requester.id = el.requester_user_id
             LEFT JOIN incident_areas ia ON ia.id = el.target_incident_area_id
             LEFT JOIN users approver ON approver.id = el.approved_by_user_id
             LEFT JOIN users deliverer ON deliverer.id = el.delivered_by_user_id
             LEFT JOIN users returner ON returner.id = el.returned_by_user_id
             WHERE el.id = ? AND el.active = TRUE`,
            [loanId]
        );
        if (!loanRows[0]) return null;

        const items = await query(
            `SELECT
                eli.*,
                e.name AS equipment_name,
                e.serial_number AS equipment_serial_number,
                e.status AS equipment_status,
                ep.name AS pool_name
             FROM equipment_loan_items eli
             LEFT JOIN equipment e ON e.id = eli.equipment_id
             LEFT JOIN equipment_pools ep ON ep.id = eli.pool_id
             WHERE eli.loan_id = ? AND eli.active = TRUE
             ORDER BY eli.id`,
            [loanId]
        );

        const checklists = await query(
            `SELECT
                c.*,
                u.full_name AS created_by_user_name
             FROM equipment_loan_checklists c
             INNER JOIN users u ON u.id = c.created_by_user_id
             INNER JOIN equipment_loan_items eli ON eli.id = c.loan_item_id
             WHERE eli.loan_id = ?
             ORDER BY c.id`,
            [loanId]
        );

        const incidents = await query(
            `SELECT
                i.*,
                u.full_name AS reported_by_user_name
             FROM equipment_loan_incidents i
             INNER JOIN users u ON u.id = i.reported_by_user_id
             INNER JOIN equipment_loan_items eli ON eli.id = i.loan_item_id
             WHERE eli.loan_id = ?
             ORDER BY i.id`,
            [loanId]
        );

        const history = await query(
            `SELECT
                h.*,
                u.full_name AS changed_by_user_name
             FROM equipment_loan_history h
             LEFT JOIN users u ON u.id = h.changed_by_user_id
             WHERE h.loan_id = ?
             ORDER BY h.id`,
            [loanId]
        );

        let comments = [];
        try {
            comments = await query(
                `SELECT
                    elc.*,
                    u.full_name AS created_by_user_name,
                    CASE
                        WHEN u.role_id = 1 THEN 'administrator'
                        WHEN u.role_id = 2 THEN 'technician'
                        ELSE 'end_user'
                    END AS created_by_user_role
                 FROM equipment_loan_comments elc
                 INNER JOIN users u ON u.id = elc.created_by_user_id
                 WHERE elc.equipment_loan_id = ?
                 ORDER BY elc.id`,
                [loanId]
            );
        } catch (err) {
            console.warn(
                '[EquipmentLoan.findById] No se pudieron cargar comentarios (¿falta migración equipment_loan_comments?):',
                err.message
            );
        }

        return {
            ...loanRows[0],
            items,
            checklists,
            incidents,
            history,
            comments
        };
    }

    static async findAll(filters = {}) {
        const params = [];
        let sql = `
            SELECT
                el.id,
                CONCAT('SOL-', YEAR(el.created_at), '-', LPAD(el.id, 4, '0')) AS request_code,
                el.requester_user_id,
                requester.full_name AS requester_name,
                ia.name AS target_incident_area_name,
                el.status,
                el.start_date,
                el.expected_return_date,
                el.created_at,
                COUNT(eli.id) AS items_count
            FROM equipment_loans el
            INNER JOIN users requester ON requester.id = el.requester_user_id
            LEFT JOIN incident_areas ia ON ia.id = el.target_incident_area_id
            LEFT JOIN equipment_loan_items eli ON eli.loan_id = el.id AND eli.active = TRUE
            WHERE el.active = TRUE
        `;

        if (filters.status) {
            sql += ' AND el.status = ?';
            params.push(filters.status);
        }
        if (filters.requester_user_id) {
            sql += ' AND el.requester_user_id = ?';
            params.push(filters.requester_user_id);
        }
        if (filters.date_from) {
            sql += ' AND el.start_date >= ?';
            params.push(filters.date_from);
        }
        if (filters.date_to) {
            sql += ' AND el.expected_return_date <= ?';
            params.push(filters.date_to);
        }
        if (filters.search) {
            sql += ` AND (
                requester.full_name LIKE ?
                OR ia.name LIKE ?
                OR CAST(el.id AS CHAR) LIKE ?
                OR CONCAT('SOL-', YEAR(el.created_at), '-', LPAD(el.id, 4, '0')) LIKE ?
            )`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        sql += ' GROUP BY el.id ORDER BY el.created_at DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(Number(filters.limit));
        }
        if (filters.offset) {
            sql += ' OFFSET ?';
            params.push(Number(filters.offset));
        }

        return await query(sql, params);
    }

    static async count(filters = {}) {
        const params = [];
        let sql = 'SELECT COUNT(*) AS total FROM equipment_loans el WHERE el.active = TRUE';
        if (filters.status) {
            sql += ' AND el.status = ?';
            params.push(filters.status);
        }
        if (filters.requester_user_id) {
            sql += ' AND el.requester_user_id = ?';
            params.push(filters.requester_user_id);
        }
        if (filters.date_from) {
            sql += ' AND el.start_date >= ?';
            params.push(filters.date_from);
        }
        if (filters.date_to) {
            sql += ' AND el.expected_return_date <= ?';
            params.push(filters.date_to);
        }
        if (filters.search) {
            sql += ` AND (
                EXISTS (
                    SELECT 1
                    FROM users requester
                    WHERE requester.id = el.requester_user_id
                      AND requester.full_name LIKE ?
                )
                OR EXISTS (
                    SELECT 1
                    FROM incident_areas ia
                    WHERE ia.id = el.target_incident_area_id
                      AND ia.name LIKE ?
                )
                OR CAST(el.id AS CHAR) LIKE ?
                OR CONCAT('SOL-', YEAR(el.created_at), '-', LPAD(el.id, 4, '0')) LIKE ?
            )`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        const result = await query(sql, params);
        return Number(result[0]?.total ?? 0);
    }

    static async approve(loanId, approvedByUserId, notes) {
        return await this._changeStatus({
            loanId,
            nextStatus: 'approved',
            allowedCurrentStatuses: ['pending'],
            changedByUserId: approvedByUserId,
            notes: notes || 'Préstamo aprobado por IT',
            beforeStatusChange: async (conn) => {
                await this._ensureLoanItemsCanBeAllocated(conn, loanId, 'approve');
            },
            sideEffects: async (conn, loan) => {
                await conn.query(
                    'UPDATE equipment_loans SET approved_by_user_id = ? WHERE id = ?',
                    [approvedByUserId, loanId]
                );
                const items = await conn.query(
                    'SELECT pool_id, quantity FROM equipment_loan_items WHERE loan_id = ? AND active = TRUE AND pool_id IS NOT NULL',
                    [loanId]
                );
                for (const item of items) {
                    const stockUpdateResult = await conn.query(
                        `UPDATE equipment_pools
                         SET available_stock = available_stock - ?
                         WHERE id = ? AND available_stock >= ?`,
                        [item.quantity, item.pool_id, item.quantity]
                    );
                    if (Number(stockUpdateResult.affectedRows || 0) === 0) {
                        throw new Error(`Stock insuficiente para el pool ${item.pool_id}`);
                    }
                }

                const requesterRows = await conn.query(
                    'SELECT requester_user_id FROM equipment_loans WHERE id = ?',
                    [loanId]
                );
                const requesterId = requesterRows[0]?.requester_user_id;
                if (requesterId != null) {
                    const eqItems = await conn.query(
                        `SELECT equipment_id
                         FROM equipment_loan_items
                         WHERE loan_id = ? AND active = TRUE AND equipment_id IS NOT NULL`,
                        [loanId]
                    );
                    for (const row of eqItems) {
                        await conn.query(
                            `UPDATE equipment
                             SET status = 'assigned', assigned_to_user_id = ?
                             WHERE id = ?`,
                            [requesterId, row.equipment_id]
                        );
                    }
                }
            }
        });
    }

    static async reject(loanId, rejectedByUserId, reason) {
        return await this._changeStatus({
            loanId,
            nextStatus: 'rejected',
            allowedCurrentStatuses: ['pending', 'approved'],
            changedByUserId: rejectedByUserId,
            notes: reason || 'Préstamo rechazado por IT',
            sideEffects: async (conn, loan) => {
                await conn.query(
                    'UPDATE equipment_loans SET rejection_reason = ? WHERE id = ?',
                    [reason || null, loanId]
                );

                if (loan.status === 'approved') {
                    const poolItems = await conn.query(
                        `SELECT pool_id, quantity
                         FROM equipment_loan_items
                         WHERE loan_id = ?
                           AND active = TRUE
                           AND pool_id IS NOT NULL`,
                        [loanId]
                    );
                    for (const item of poolItems) {
                        await conn.query(
                            'UPDATE equipment_pools SET available_stock = available_stock + ? WHERE id = ?',
                            [item.quantity, item.pool_id]
                        );
                    }
                }

                await this._releaseLoanEquipmentItems(conn, loanId);
            }
        });
    }

    static async updatePendingChecklist(loanId, userId, payload) {
        const conn = await getConnection();
        try {
            await conn.beginTransaction();
            const loanRows = await conn.query(
                `SELECT id, status, requester_user_id
                 FROM equipment_loans
                 WHERE id = ? AND active = TRUE
                 FOR UPDATE`,
                [loanId]
            );
            const loan = loanRows[0];
            if (!loan) {
                throw new Error('Préstamo no encontrado');
            }
            if (loan.status !== 'pending') {
                throw new Error('Solo se puede actualizar checklist en solicitudes pendientes');
            }
            if (loan.requester_user_id !== userId) {
                throw new Error('No tienes permisos para actualizar esta solicitud');
            }

            await conn.query(
                `UPDATE equipment_loans
                 SET pending_physical_condition = ?,
                     pending_battery_level = ?,
                     pending_observations = ?
                 WHERE id = ?`,
                [
                    payload.physical_condition || null,
                    payload.battery_level ?? null,
                    payload.observations || null,
                    loanId
                ]
            );

            await conn.commit();
            return await this.findById(loanId);
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    static async deliver(loanId, deliveredByUserId, payload) {
        return await this._changeStatus({
            loanId,
            nextStatus: 'delivered',
            allowedCurrentStatuses: ['approved'],
            changedByUserId: deliveredByUserId,
            notes: payload.notes || 'Entrega registrada',
            beforeStatusChange: async (conn) => {
                await this._ensureLoanItemsCanBeAllocated(conn, loanId, 'deliver');
            },
            sideEffects: async (conn) => {
                await conn.query(
                    'UPDATE equipment_loans SET delivered_by_user_id = ?, delivered_at = NOW() WHERE id = ?',
                    [deliveredByUserId, loanId]
                );
                const reqRows = await conn.query(
                    'SELECT requester_user_id FROM equipment_loans WHERE id = ?',
                    [loanId]
                );
                const requesterUserId = reqRows[0]?.requester_user_id ?? null;
                const loanItems = await conn.query(
                    'SELECT id, equipment_id FROM equipment_loan_items WHERE loan_id = ? AND active = TRUE',
                    [loanId]
                );
                for (const item of loanItems) {
                    if (item.equipment_id) {
                        await conn.query(
                            `UPDATE equipment
                             SET status = 'assigned', assigned_to_user_id = ?
                             WHERE id = ?`,
                            [requesterUserId, item.equipment_id]
                        );
                    }
                    await conn.query(
                        `INSERT INTO equipment_loan_checklists (
                            loan_item_id, checklist_type, battery_level, physical_condition, accessories, observations, created_by_user_id
                        ) VALUES (?, 'delivery', ?, ?, ?, ?, ?)`,
                        [
                            item.id,
                            payload.battery_level ?? null,
                            payload.physical_condition || 'good',
                            payload.accessories || null,
                            payload.observations || null,
                            deliveredByUserId
                        ]
                    );
                }
            }
        });
    }

    static _equipmentLabel(item) {
        const name = item.equipment_name || 'Equipo';
        if (item.equipment_serial) {
            return `${name} (SN: ${item.equipment_serial})`;
        }
        return name;
    }

    /** @param {'approve' | 'deliver'} phase */
    static _loanAllocationErrorPrefix(phase) {
        if (phase === 'deliver') {
            return 'No se puede registrar la entrega:';
        }
        return 'No se puede aprobar el préstamo:';
    }

    static async _ensureLoanItemsCanBeAllocated(conn, loanId, phase = 'approve') {
        const p = this._loanAllocationErrorPrefix(phase);
        const metaRows = await conn.query(
            'SELECT requester_user_id FROM equipment_loans WHERE id = ?',
            [loanId]
        );
        const requesterUserId = metaRows[0]?.requester_user_id ?? null;

        const equipmentItems = await conn.query(
            `SELECT
                eli.equipment_id,
                e.name AS equipment_name,
                e.serial_number AS equipment_serial,
                e.status AS equipment_status,
                e.active AS equipment_active,
                e.assigned_to_user_id AS equipment_assigned_to_user_id
             FROM equipment_loan_items eli
             INNER JOIN equipment e ON e.id = eli.equipment_id
             WHERE eli.loan_id = ?
               AND eli.active = TRUE
               AND eli.equipment_id IS NOT NULL`,
            [loanId]
        );

        for (const item of equipmentItems) {
            const label = this._equipmentLabel(item);

            if (!item.equipment_active) {
                throw new Error(`${p} el equipo "${label}" está inactivo.`);
            }

            const assignedToBorrower =
                phase === 'deliver' &&
                item.equipment_status === 'assigned' &&
                requesterUserId != null &&
                Number(item.equipment_assigned_to_user_id) === Number(requesterUserId);

            if (assignedToBorrower) {
                // Reservado al aprobar el préstamo; la entrega solo registra checklist.
            } else if (item.equipment_status === 'assigned') {
                throw new Error(
                    `${p} el equipo "${label}" ya está asignado. ` +
                        'Verifique si corresponde a otra persona o devuelva el préstamo anterior antes de continuar.'
                );
            } else if (item.equipment_status === 'maintenance') {
                throw new Error(`${p} el equipo "${label}" está en mantenimiento.`);
            } else if (item.equipment_status === 'retired') {
                throw new Error(`${p} el equipo "${label}" está dado de baja.`);
            } else if (item.equipment_status !== 'available') {
                throw new Error(
                    `${p} el equipo "${label}" no está disponible (estado: ${item.equipment_status}).`
                );
            }

            const overlap = await conn.query(
                `SELECT el.id
                 FROM equipment_loan_items eli
                 INNER JOIN equipment_loans el ON el.id = eli.loan_id
                 WHERE eli.equipment_id = ?
                   AND eli.active = TRUE
                   AND el.active = TRUE
                   AND el.id <> ?
                   AND el.status IN ('approved', 'delivered', 'overdue')
                 LIMIT 1`,
                [item.equipment_id, loanId]
            );

            if (overlap.length > 0) {
                throw new Error(
                    `${p} el equipo "${label}" ya forma parte de otro préstamo aprobado, entregado o vencido. ` +
                        'Cancele o cierre el otro movimiento antes de continuar.'
                );
            }
        }
    }

    static async returnLoan(loanId, returnedByUserId, payload) {
        return await this._changeStatus({
            loanId,
            nextStatus: 'returned',
            allowedCurrentStatuses: ['delivered', 'overdue'],
            changedByUserId: returnedByUserId,
            notes: payload.notes || 'Devolución registrada',
            sideEffects: async (conn) => {
                await conn.query(
                    'UPDATE equipment_loans SET returned_by_user_id = ?, returned_at = NOW() WHERE id = ?',
                    [returnedByUserId, loanId]
                );
                const loanItems = await conn.query(
                    'SELECT id, equipment_id, pool_id, quantity FROM equipment_loan_items WHERE loan_id = ? AND active = TRUE',
                    [loanId]
                );
                for (const item of loanItems) {
                    if (item.equipment_id) {
                        await conn.query(
                            `UPDATE equipment
                             SET status = 'available', assigned_to_user_id = NULL
                             WHERE id = ?`,
                            [item.equipment_id]
                        );
                    }
                    if (item.pool_id) {
                        await conn.query(
                            'UPDATE equipment_pools SET available_stock = available_stock + ? WHERE id = ?',
                            [item.quantity, item.pool_id]
                        );
                    }
                    await conn.query(
                        `INSERT INTO equipment_loan_checklists (
                            loan_item_id, checklist_type, battery_level, physical_condition, accessories, observations, created_by_user_id
                        ) VALUES (?, 'return', ?, ?, ?, ?, ?)`,
                        [
                            item.id,
                            payload.battery_level ?? null,
                            payload.physical_condition || 'good',
                            payload.accessories || null,
                            payload.observations || null,
                            returnedByUserId
                        ]
                    );
                }

                if (Array.isArray(payload.incidents)) {
                    for (const incident of payload.incidents) {
                        await conn.query(
                            `INSERT INTO equipment_loan_incidents (
                                loan_item_id, incident_type, description, estimated_cost, reported_by_user_id
                            ) VALUES (?, ?, ?, ?, ?)`,
                            [
                                incident.loan_item_id,
                                incident.incident_type,
                                incident.description,
                                incident.estimated_cost || null,
                                returnedByUserId
                            ]
                        );
                    }
                }
            }
        });
    }

    static async cancel(loanId, cancelledByUserId, notes) {
        return await this._changeStatus({
            loanId,
            nextStatus: 'cancelled',
            allowedCurrentStatuses: ['pending', 'approved'],
            changedByUserId: cancelledByUserId,
            notes: notes || 'Préstamo cancelado',
            sideEffects: async (conn, loan) => {
                if (loan.status === 'approved') {
                    const items = await conn.query(
                        'SELECT pool_id, quantity FROM equipment_loan_items WHERE loan_id = ? AND active = TRUE AND pool_id IS NOT NULL',
                        [loanId]
                    );
                    for (const item of items) {
                        await conn.query(
                            'UPDATE equipment_pools SET available_stock = available_stock + ? WHERE id = ?',
                            [item.quantity, item.pool_id]
                        );
                    }
                    await this._releaseLoanEquipmentItems(conn, loanId);
                }
            }
        });
    }

    static async revokeApproval(loanId, revokedByUserId, notes) {
        return await this._changeStatus({
            loanId,
            nextStatus: 'pending',
            allowedCurrentStatuses: ['approved'],
            changedByUserId: revokedByUserId,
            notes: notes?.trim() || 'Aprobación anulada por administración',
            sideEffects: async (conn) => {
                await conn.query(
                    `UPDATE equipment_loans
                     SET approved_by_user_id = NULL, approval_notes = NULL
                     WHERE id = ?`,
                    [loanId]
                );
                const poolItems = await conn.query(
                    `SELECT pool_id, quantity
                     FROM equipment_loan_items
                     WHERE loan_id = ? AND active = TRUE AND pool_id IS NOT NULL`,
                    [loanId]
                );
                for (const item of poolItems) {
                    await conn.query(
                        'UPDATE equipment_pools SET available_stock = available_stock + ? WHERE id = ?',
                        [item.quantity, item.pool_id]
                    );
                }
                await this._releaseLoanEquipmentItems(conn, loanId);
            }
        });
    }

    static async addComment(equipmentLoanId, userId, commentText) {
        await query(
            `INSERT INTO equipment_loan_comments
                (equipment_loan_id, comment_text, created_by_user_id)
             VALUES (?, ?, ?)`,
            [equipmentLoanId, commentText, userId]
        );
        const comments = await this.getComments(equipmentLoanId);
        return comments[comments.length - 1] || null;
    }

    static async getComments(equipmentLoanId) {
        try {
            return await query(
                `SELECT
                    elc.*,
                    u.full_name AS created_by_user_name,
                    CASE
                        WHEN u.role_id = 1 THEN 'administrator'
                        WHEN u.role_id = 2 THEN 'technician'
                        ELSE 'end_user'
                    END AS created_by_user_role
                 FROM equipment_loan_comments elc
                 INNER JOIN users u ON u.id = elc.created_by_user_id
                 WHERE elc.equipment_loan_id = ?
                 ORDER BY elc.id`,
                [equipmentLoanId]
            );
        } catch (err) {
            console.warn('[EquipmentLoan.getComments]', err.message);
            return [];
        }
    }

    static async markOverdue() {
        return await query(
            `UPDATE equipment_loans
             SET status = 'overdue'
             WHERE active = TRUE
               AND status = 'delivered'
               AND expected_return_date < CURDATE()`
        );
    }

    static async getReportSummary(dateFrom, dateTo) {
        const [totals] = await query(
            `SELECT
                COUNT(*) AS total_requests,
                SUM(CASE WHEN status IN ('approved', 'delivered', 'returned', 'overdue') THEN 1 ELSE 0 END) AS approved_count,
                SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) AS returned_count,
                SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) AS overdue_count
             FROM equipment_loans
             WHERE active = TRUE
               AND created_at >= ?
               AND created_at < DATE_ADD(?, INTERVAL 1 DAY)`,
            [dateFrom, dateTo]
        );

        const byStatus = await query(
            `SELECT status, COUNT(*) AS count
             FROM equipment_loans
             WHERE active = TRUE
               AND created_at >= ?
               AND created_at < DATE_ADD(?, INTERVAL 1 DAY)
             GROUP BY status
             ORDER BY status`,
            [dateFrom, dateTo]
        );

        const topRequesters = await query(
            `SELECT
                el.requester_user_id AS user_id,
                u.full_name AS user_name,
                COUNT(*) AS count
             FROM equipment_loans el
             INNER JOIN users u ON u.id = el.requester_user_id
             WHERE el.active = TRUE
               AND el.created_at >= ?
               AND el.created_at < DATE_ADD(?, INTERVAL 1 DAY)
             GROUP BY el.requester_user_id, u.full_name
             ORDER BY count DESC
             LIMIT 10`,
            [dateFrom, dateTo]
        );

        const incidents = await query(
            `SELECT
                i.incident_type,
                COUNT(*) AS count
             FROM equipment_loan_incidents i
             INNER JOIN equipment_loan_items li ON li.id = i.loan_item_id
             INNER JOIN equipment_loans l ON l.id = li.loan_id
             WHERE l.active = TRUE
               AND l.created_at >= ?
               AND l.created_at < DATE_ADD(?, INTERVAL 1 DAY)
             GROUP BY i.incident_type
             ORDER BY count DESC`,
            [dateFrom, dateTo]
        );

        return { totals, byStatus, topRequesters, incidents };
    }

    static async _changeStatus({
        loanId,
        nextStatus,
        allowedCurrentStatuses,
        changedByUserId,
        notes,
        beforeStatusChange,
        sideEffects
    }) {
        const conn = await getConnection();
        try {
            await conn.beginTransaction();
            const loanRows = await conn.query(
                'SELECT id, status FROM equipment_loans WHERE id = ? AND active = TRUE FOR UPDATE',
                [loanId]
            );
            const loan = loanRows[0];
            if (!loan) {
                throw new Error('Préstamo no encontrado');
            }
            const previousStatus =
                loan.status === null || loan.status === undefined
                    ? ''
                    : String(loan.status).trim();
            if (!allowedCurrentStatuses.includes(previousStatus)) {
                throw new Error(`No se puede cambiar de ${previousStatus || loan.status} a ${nextStatus}`);
            }

            if (beforeStatusChange) {
                await beforeStatusChange(conn, loan);
            }

            await conn.query('UPDATE equipment_loans SET status = ? WHERE id = ?', [nextStatus, loanId]);
            await conn.query(
                `INSERT INTO equipment_loan_history (loan_id, changed_by_user_id, previous_status, new_status, notes)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    loanId,
                    changedByUserId,
                    previousStatus || null,
                    nextStatus,
                    notes || null
                ]
            );

            if (sideEffects) {
                await sideEffects(conn, loan);
            }

            await conn.commit();
            return await this.findById(loanId);
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
}

export default EquipmentLoan;
