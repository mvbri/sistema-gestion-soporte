import { getConnection, query } from '../config/database.js';

class MaterialRequest {
    static async create(data) {
        const {
            requester_user_id,
            request_notes,
            addressee_name,
            addressee_title,
            addressee_addressing_text,
            items
        } = data;
        const conn = await getConnection();

        try {
            await conn.beginTransaction();

            const repeatedEquipment = new Set();
            for (const item of items) {
                if ((item.source_mode || 'catalog') === 'manual') continue;
                if (item.material_type !== 'equipment') continue;
                const equipmentId = Number(item.reference_id);
                if (repeatedEquipment.has(equipmentId)) {
                    throw new Error('No puedes solicitar el mismo equipo más de una vez en la misma solicitud');
                }
                repeatedEquipment.add(equipmentId);
            }

            const requestResult = await conn.query(
                `INSERT INTO material_requests (requester_user_id, request_notes, addressee_name, addressee_title, addressee_addressing_text)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    requester_user_id,
                    request_notes || null,
                    String(addressee_name || '').trim(),
                    String(addressee_title || '').trim(),
                    String(addressee_addressing_text || '').trim()
                ]
            );

            const materialRequestId = requestResult.insertId;

            for (const item of items) {
                const sourceMode = item.source_mode || 'catalog';
                await this._validateRequestItem(conn, item);
                await conn.query(
                    `INSERT INTO material_request_items
                        (material_request_id, material_type, source_mode, reference_id, custom_material_name, custom_material_description, quantity)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        materialRequestId,
                        item.material_type,
                        sourceMode,
                        sourceMode === 'manual' ? null : Number(item.reference_id),
                        sourceMode === 'manual' ? String(item.custom_material_name || '').trim() : null,
                        sourceMode === 'manual' ? String(item.custom_material_description || '').trim() || null : null,
                        Number(item.quantity || 1)
                    ]
                );
            }

            await conn.query(
                `INSERT INTO material_request_history
                    (material_request_id, changed_by_user_id, previous_status, new_status, notes)
                 VALUES (?, ?, NULL, 'pending', ?)`,
                [materialRequestId, requester_user_id, 'Solicitud creada']
            );

            await conn.commit();
            return await this.findById(materialRequestId);
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    static async _validateRequestItem(conn, item) {
        const sourceMode = item.source_mode || 'catalog';
        if (sourceMode === 'manual') {
            const materialType = item.material_type;
            if (!['equipment', 'consumable', 'tool'].includes(materialType)) {
                throw new Error('El material manual debe clasificarse como equipo, consumible o herramienta');
            }
            const customName = String(item.custom_material_name || '').trim();
            if (customName.length < 2) {
                throw new Error('El material manual debe tener un nombre válido');
            }
            const quantity = Number(item.quantity || 1);
            if (!Number.isInteger(quantity) || quantity < 1) {
                throw new Error('La cantidad del material manual debe ser un entero mayor a 0');
            }
            return;
        }

        const materialType = item.material_type;
        const referenceId = Number(item.reference_id);
        const quantity = Number(item.quantity || 1);

        if (!['equipment', 'consumable', 'tool'].includes(materialType)) {
            throw new Error('Tipo de material inválido');
        }
        if (!Number.isInteger(referenceId) || referenceId < 1) {
            throw new Error('El material de la solicitud no es válido');
        }
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new Error('La cantidad debe ser mayor a 0');
        }

        if (materialType === 'equipment') {
            if (quantity !== 1) {
                throw new Error('Los equipos se solicitan con cantidad 1');
            }
            const equipmentRows = await conn.query(
                `SELECT id, name, active, status
                 FROM equipment
                 WHERE id = ?
                 LIMIT 1`,
                [referenceId]
            );
            const equipment = equipmentRows[0];
            if (!equipment || !equipment.active) {
                throw new Error('El equipo seleccionado no existe o está inactivo');
            }
            if (equipment.status !== 'available') {
                throw new Error(`El equipo "${equipment.name}" no está disponible`);
            }
            return;
        }

        if (materialType === 'consumable') {
            const consumableRows = await conn.query(
                `SELECT id, name, active, quantity, status
                 FROM consumables
                 WHERE id = ?
                 LIMIT 1`,
                [referenceId]
            );
            const consumable = consumableRows[0];
            if (!consumable || !consumable.active) {
                throw new Error('El consumible seleccionado no existe o está inactivo');
            }
            if (consumable.status === 'inactive') {
                throw new Error(`El consumible "${consumable.name}" está inactivo`);
            }
            if (Number(consumable.quantity) < quantity) {
                throw new Error(`Stock insuficiente para consumible "${consumable.name}"`);
            }
            return;
        }

        const toolRows = await conn.query(
            `SELECT id, name, active, status
             FROM tools
             WHERE id = ?
             LIMIT 1`,
            [referenceId]
        );
        const tool = toolRows[0];
        if (!tool || !tool.active) {
            throw new Error('La herramienta seleccionada no existe o está inactiva');
        }
        if (tool.status !== 'available') {
            throw new Error(`La herramienta "${tool.name}" no está disponible`);
        }
        if (quantity !== 1) {
            throw new Error('Las herramientas se solicitan con cantidad 1');
        }
    }

    static async findById(id) {
        const requestRows = await query(
            `SELECT
                mr.*,
                CONCAT('MAT-', YEAR(mr.created_at), '-', LPAD(mr.id, 4, '0')) AS request_code,
                requester.full_name AS requester_name,
                requester.email AS requester_email,
                approver.full_name AS approved_by_user_name
             FROM material_requests mr
             INNER JOIN users requester ON requester.id = mr.requester_user_id
             LEFT JOIN users approver ON approver.id = mr.approved_by_user_id
             WHERE mr.id = ? AND mr.active = TRUE
             LIMIT 1`,
            [id]
        );

        const materialRequest = requestRows[0];
        if (!materialRequest) return null;

        const items = await query(
            `SELECT
                mri.*,
                CASE
                    WHEN mri.source_mode = 'manual' THEN mri.custom_material_name
                    WHEN mri.material_type = 'equipment' THEN e.name
                    WHEN mri.material_type = 'consumable' THEN c.name
                    WHEN mri.material_type = 'tool' THEN t.name
                    ELSE NULL
                END AS material_name,
                e.serial_number AS equipment_serial_number,
                t.code AS tool_code,
                c.unit AS consumable_unit,
                c.quantity AS consumable_available_quantity
             FROM material_request_items mri
             LEFT JOIN equipment e
                ON mri.material_type = 'equipment'
               AND mri.reference_id = e.id
             LEFT JOIN consumables c
                ON mri.material_type = 'consumable'
               AND mri.reference_id = c.id
             LEFT JOIN tools t
                ON mri.material_type = 'tool'
               AND mri.reference_id = t.id
             WHERE mri.material_request_id = ?
               AND mri.active = TRUE
             ORDER BY mri.id`,
            [id]
        );

        const history = await query(
            `SELECT
                mrh.*,
                u.full_name AS changed_by_user_name
             FROM material_request_history mrh
             INNER JOIN users u ON u.id = mrh.changed_by_user_id
             WHERE mrh.material_request_id = ?
             ORDER BY mrh.id`,
            [id]
        );

        const comments = await query(
            `SELECT
                mrc.*,
                u.full_name AS created_by_user_name,
                CASE
                    WHEN u.role_id = 1 THEN 'administrator'
                    WHEN u.role_id = 2 THEN 'technician'
                    ELSE 'end_user'
                END AS created_by_user_role
             FROM material_request_comments mrc
             INNER JOIN users u ON u.id = mrc.created_by_user_id
             WHERE mrc.material_request_id = ?
             ORDER BY mrc.id`,
            [id]
        );

        return {
            ...materialRequest,
            items,
            history,
            comments
        };
    }

    static async findAll(filters = {}) {
        const params = [];
        let sql = `
            SELECT
                mr.id,
                CONCAT('MAT-', YEAR(mr.created_at), '-', LPAD(mr.id, 4, '0')) AS request_code,
                mr.requester_user_id,
                requester.full_name AS requester_name,
                mr.status,
                mr.request_notes,
                mr.created_at,
                COUNT(mri.id) AS items_count
            FROM material_requests mr
            INNER JOIN users requester ON requester.id = mr.requester_user_id
            LEFT JOIN material_request_items mri ON mri.material_request_id = mr.id AND mri.active = TRUE
            WHERE mr.active = TRUE
        `;

        if (filters.status) {
            sql += ' AND mr.status = ?';
            params.push(filters.status);
        }
        if (filters.requester_user_id) {
            sql += ' AND mr.requester_user_id = ?';
            params.push(filters.requester_user_id);
        }
        if (filters.date_from) {
            sql += ' AND DATE(mr.created_at) >= ?';
            params.push(filters.date_from);
        }
        if (filters.date_to) {
            sql += ' AND DATE(mr.created_at) <= ?';
            params.push(filters.date_to);
        }
        if (filters.search) {
            sql += ` AND (
                requester.full_name LIKE ?
                OR CAST(mr.id AS CHAR) LIKE ?
                OR CONCAT('MAT-', YEAR(mr.created_at), '-', LPAD(mr.id, 4, '0')) LIKE ?
                OR mr.request_notes LIKE ?
            )`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        sql += ' GROUP BY mr.id ORDER BY mr.created_at DESC';
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
        let sql = 'SELECT COUNT(*) AS total FROM material_requests mr WHERE mr.active = TRUE';
        if (filters.status) {
            sql += ' AND mr.status = ?';
            params.push(filters.status);
        }
        if (filters.requester_user_id) {
            sql += ' AND mr.requester_user_id = ?';
            params.push(filters.requester_user_id);
        }
        if (filters.date_from) {
            sql += ' AND DATE(mr.created_at) >= ?';
            params.push(filters.date_from);
        }
        if (filters.date_to) {
            sql += ' AND DATE(mr.created_at) <= ?';
            params.push(filters.date_to);
        }
        if (filters.search) {
            sql += ` AND (
                EXISTS (
                    SELECT 1
                    FROM users requester
                    WHERE requester.id = mr.requester_user_id
                      AND requester.full_name LIKE ?
                )
                OR CAST(mr.id AS CHAR) LIKE ?
                OR CONCAT('MAT-', YEAR(mr.created_at), '-', LPAD(mr.id, 4, '0')) LIKE ?
                OR mr.request_notes LIKE ?
            )`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        const result = await query(sql, params);
        return Number(result[0]?.total ?? 0);
    }

    static async approve(id, approvedByUserId, notes) {
        return await this._changeStatus({
            materialRequestId: id,
            nextStatus: 'approved',
            allowedCurrentStatuses: ['pending'],
            changedByUserId: approvedByUserId,
            notes: notes || 'Solicitud aprobada'
        });
    }

    static async reject(id, rejectedByUserId, reason) {
        return await this._changeStatus({
            materialRequestId: id,
            nextStatus: 'rejected',
            allowedCurrentStatuses: ['pending', 'approved'],
            changedByUserId: rejectedByUserId,
            notes: reason || 'Solicitud rechazada',
            sideEffects: async (conn) => {
                await conn.query(
                    `UPDATE material_requests
                     SET rejection_reason = ?
                     WHERE id = ?`,
                    [reason || null, id]
                );
            }
        });
    }

    static async cancel(id, cancelledByUserId, notes) {
        return await this._changeStatus({
            materialRequestId: id,
            nextStatus: 'cancelled',
            allowedCurrentStatuses: ['pending', 'approved'],
            changedByUserId: cancelledByUserId,
            notes: notes || 'Solicitud cancelada',
            sideEffects: async (conn) => {
                await conn.query(
                    `UPDATE material_requests
                     SET cancelled_notes = ?
                     WHERE id = ?`,
                    [notes || null, id]
                );
            }
        });
    }

    static async _applyInventoryAllocation(conn, materialRequestId) {
        const requestRows = await conn.query(
            `SELECT requester_user_id
             FROM material_requests
             WHERE id = ?
             LIMIT 1`,
            [materialRequestId]
        );
        const materialRequest = requestRows[0];
        if (!materialRequest) {
            throw new Error('Solicitud no encontrada para aplicar asignación');
        }

        const items = await conn.query(
            `SELECT material_type, source_mode, reference_id, quantity
             FROM material_request_items
             WHERE material_request_id = ?
               AND active = TRUE`,
            [materialRequestId]
        );

        for (const item of items) {
            if (item.source_mode === 'manual' || item.material_type === 'manual') {
                continue;
            }
            if (item.material_type === 'equipment') {
                const equipmentUpdate = await conn.query(
                    `UPDATE equipment
                     SET assigned_to_user_id = ?, status = 'assigned'
                     WHERE id = ?
                       AND active = TRUE
                       AND status = 'available'`,
                    [materialRequest.requester_user_id, item.reference_id]
                );
                if (Number(equipmentUpdate.affectedRows || 0) === 0) {
                    throw new Error(`No se pudo asignar el equipo ${item.reference_id} (no disponible)`);
                }
                continue;
            }

            if (item.material_type === 'tool') {
                const toolUpdate = await conn.query(
                    `UPDATE tools
                     SET assigned_to_user_id = ?, status = 'assigned'
                     WHERE id = ?
                       AND active = TRUE
                       AND status = 'available'`,
                    [materialRequest.requester_user_id, item.reference_id]
                );
                if (Number(toolUpdate.affectedRows || 0) === 0) {
                    throw new Error(`No se pudo asignar la herramienta ${item.reference_id} (no disponible)`);
                }
                continue;
            }

            const consumableUpdate = await conn.query(
                `UPDATE consumables
                 SET quantity = quantity - ?
                 WHERE id = ?
                   AND active = TRUE
                   AND quantity >= ?`,
                [item.quantity, item.reference_id, item.quantity]
            );
            if (Number(consumableUpdate.affectedRows || 0) === 0) {
                throw new Error(`No se pudo descontar stock del consumible ${item.reference_id}`);
            }
        }
    }

    static async _releaseInventoryAllocation(conn, materialRequestId) {
        const items = await conn.query(
            `SELECT material_type, source_mode, reference_id, quantity
             FROM material_request_items
             WHERE material_request_id = ?
               AND active = TRUE`,
            [materialRequestId]
        );

        for (const item of items) {
            if (item.source_mode === 'manual' || item.material_type === 'manual') {
                continue;
            }
            if (item.material_type === 'equipment') {
                await conn.query(
                    `UPDATE equipment
                     SET assigned_to_user_id = NULL, status = 'available'
                     WHERE id = ?`,
                    [item.reference_id]
                );
                continue;
            }

            if (item.material_type === 'tool') {
                await conn.query(
                    `UPDATE tools
                     SET assigned_to_user_id = NULL, status = 'available'
                     WHERE id = ?`,
                    [item.reference_id]
                );
                continue;
            }

            await conn.query(
                `UPDATE consumables
                 SET quantity = quantity + ?
                 WHERE id = ?`,
                [item.quantity, item.reference_id]
            );
        }
    }

    static async addComment(materialRequestId, userId, commentText) {
        await query(
            `INSERT INTO material_request_comments
                (material_request_id, comment_text, created_by_user_id)
             VALUES (?, ?, ?)`,
            [materialRequestId, commentText, userId]
        );

        const comments = await this.getComments(materialRequestId);
        return comments[comments.length - 1] || null;
    }

    static async getComments(materialRequestId) {
        return await query(
            `SELECT
                mrc.*,
                u.full_name AS created_by_user_name,
                CASE
                    WHEN u.role_id = 1 THEN 'administrator'
                    WHEN u.role_id = 2 THEN 'technician'
                    ELSE 'end_user'
                END AS created_by_user_role
             FROM material_request_comments mrc
             INNER JOIN users u ON u.id = mrc.created_by_user_id
             WHERE mrc.material_request_id = ?
             ORDER BY mrc.id`,
            [materialRequestId]
        );
    }

    static async _changeStatus({
        materialRequestId,
        nextStatus,
        allowedCurrentStatuses,
        changedByUserId,
        notes,
        sideEffects
    }) {
        const conn = await getConnection();
        try {
            await conn.beginTransaction();
            const requestRows = await conn.query(
                `SELECT id, status
                 FROM material_requests
                 WHERE id = ? AND active = TRUE
                 FOR UPDATE`,
                [materialRequestId]
            );
            const materialRequest = requestRows[0];
            if (!materialRequest) {
                throw new Error('Solicitud no encontrada');
            }
            if (!allowedCurrentStatuses.includes(materialRequest.status)) {
                throw new Error(`No se puede cambiar de ${materialRequest.status} a ${nextStatus}`);
            }

            await conn.query(
                'UPDATE material_requests SET status = ?, approved_by_user_id = IF(? = "approved", ?, approved_by_user_id), approval_notes = IF(? = "approved", ?, approval_notes) WHERE id = ?',
                [nextStatus, nextStatus, changedByUserId, nextStatus, notes || null, materialRequestId]
            );

            await conn.query(
                `INSERT INTO material_request_history
                    (material_request_id, changed_by_user_id, previous_status, new_status, notes)
                 VALUES (?, ?, ?, ?, ?)`,
                [materialRequestId, changedByUserId, materialRequest.status, nextStatus, notes || null]
            );

            if (sideEffects) {
                await sideEffects(conn, materialRequest);
            }

            await conn.commit();
            return await this.findById(materialRequestId);
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }
}

export default MaterialRequest;
