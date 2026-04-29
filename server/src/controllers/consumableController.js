import Consumable from '../models/Consumable.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { query } from '../config/database.js';

const calculateConsumableStatus = (quantity, minimumQuantity, currentStatus) => {
    if (currentStatus === 'inactive') return 'inactive';
    if (quantity <= 0) return 'out_of_stock';
    if (quantity <= minimumQuantity) return 'low_stock';
    return 'available';
};

export const createConsumable = async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'administrator') {
            return sendError(res, 'No tienes permiso para crear consumibles', null, 403);
        }

        const {
            name,
            type_id,
            unit,
            quantity,
            minimum_quantity,
            status,
            description
        } = req.body;

        const parsedQuantity = quantity !== undefined ? parseInt(quantity, 10) : 0;
        const parsedMinimumQuantity = minimum_quantity !== undefined ? parseInt(minimum_quantity, 10) : 0;

        const finalStatus = calculateConsumableStatus(parsedQuantity, parsedMinimumQuantity, status);

        const consumable = await Consumable.create({
            name,
            type_id: type_id ? parseInt(type_id, 10) : undefined,
            unit,
            quantity: parsedQuantity,
            minimum_quantity: parsedMinimumQuantity,
            status: finalStatus,
            description
        });

        sendSuccess(res, 'Consumible creado exitosamente', consumable, 201);
    } catch (error) {
        console.error('Error al crear consumible:', error);
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return sendError(
                res,
                'La tabla de consumibles no existe. Ejecuta la migración correspondiente a consumables',
                null,
                500
            );
        }
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            return sendError(
                res,
                `Error en la estructura de la base de datos: ${error.message}`,
                null,
                500
            );
        }
        sendError(res, `Error al crear consumible: ${error.message || 'Error desconocido'}`, null, 500);
    }
};

export const getConsumables = async (req, res) => {
    try {
        const { role, id: userId } = req.user;
        const {
            status,
            type,
            search,
            below_minimum,
            page = 1,
            limit = 10
        } = req.query;

        const filters = {};

        if (status) {
            filters.status = status;
        }

        if (type) {
            const parsedType = Number(type);
            filters.type = Number.isNaN(parsedType) ? type : parsedType;
        }

        if (search) {
            filters.search = search;
        }

        if (below_minimum === 'true') {
            filters.below_minimum = true;
        }

        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        filters.limit = parseInt(limit, 10);
        filters.offset = offset;

        let consumables;
        let total;

        if (role !== 'administrator') {
            const assignedParams = [userId];
            let assignedWhere = `
                WHERE mr.active = TRUE
                  AND mr.status = 'approved'
                  AND mr.requester_user_id = ?
                  AND mri.active = TRUE
                  AND mri.material_type = 'consumable'
            `;

            if (status) {
                assignedWhere += ' AND c.status = ?';
                assignedParams.push(status);
            }
            if (type) {
                const parsedType = Number(type);
                if (Number.isNaN(parsedType)) {
                    assignedWhere += ' AND ct.name = ?';
                    assignedParams.push(type);
                } else {
                    assignedWhere += ' AND c.type_id = ?';
                    assignedParams.push(parsedType);
                }
            }
            if (search) {
                assignedWhere += ' AND (c.name LIKE ? OR c.unit LIKE ? OR ct.name LIKE ?)';
                const searchTerm = `%${search}%`;
                assignedParams.push(searchTerm, searchTerm, searchTerm);
            }
            if (below_minimum === 'true') {
                assignedWhere += ' AND c.quantity <= c.minimum_quantity';
            }

            const dataSql = `
                SELECT
                    c.*,
                    ct.name AS type_name,
                    ct.description AS type_description,
                    SUM(mri.quantity) AS assigned_quantity
                FROM material_request_items mri
                INNER JOIN material_requests mr ON mr.id = mri.material_request_id
                INNER JOIN consumables c ON c.id = mri.reference_id AND c.active = TRUE
                LEFT JOIN consumable_types ct ON ct.id = c.type_id
                ${assignedWhere}
                GROUP BY c.id
                ORDER BY c.created_at DESC
                LIMIT ? OFFSET ?
            `;

            const dataParams = [...assignedParams, parseInt(limit, 10), offset];
            consumables = await query(dataSql, dataParams);

            const countSql = `
                SELECT COUNT(*) AS total
                FROM (
                    SELECT c.id
                    FROM material_request_items mri
                    INNER JOIN material_requests mr ON mr.id = mri.material_request_id
                    INNER JOIN consumables c ON c.id = mri.reference_id AND c.active = TRUE
                    LEFT JOIN consumable_types ct ON ct.id = c.type_id
                    ${assignedWhere}
                    GROUP BY c.id
                ) assigned_consumables
            `;
            const totalResult = await query(countSql, assignedParams);
            total = Number(totalResult[0]?.total ?? 0);
        } else {
            consumables = await Consumable.findAll(filters);
            total = await Consumable.count(filters);
        }

        sendSuccess(res, 'Consumibles obtenidos exitosamente', {
            consumables,
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                total,
                totalPages: Math.ceil(total / parseInt(limit, 10))
            }
        });
    } catch (error) {
        console.error('Error al obtener consumibles:', error);
        sendError(res, 'Error al obtener consumibles', null, 500);
    }
};

export const getConsumableById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, id: userId } = req.user;

        const consumable = await Consumable.findById(id);

        if (!consumable) {
            return sendError(res, 'Consumible no encontrado', null, 404);
        }

        if (role !== 'administrator') {
            const assignment = await query(
                `SELECT mri.id
                 FROM material_request_items mri
                 INNER JOIN material_requests mr ON mr.id = mri.material_request_id
                 WHERE mr.active = TRUE
                   AND mr.status = 'approved'
                   AND mr.requester_user_id = ?
                   AND mri.active = TRUE
                   AND mri.material_type = 'consumable'
                   AND mri.reference_id = ?
                 LIMIT 1`,
                [userId, id]
            );
            if (assignment.length === 0) {
                return sendError(res, 'No tienes permiso para ver este consumible', null, 403);
            }
        }

        sendSuccess(res, 'Consumible obtenido exitosamente', consumable);
    } catch (error) {
        console.error('Error al obtener consumible:', error);
        sendError(res, 'Error al obtener consumible', null, 500);
    }
};

export const updateConsumable = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;

        if (role !== 'administrator') {
            return sendError(res, 'No tienes permiso para actualizar consumibles', null, 403);
        }

        const existing = await Consumable.findById(id);
        if (!existing) {
            return sendError(res, 'Consumible no encontrado', null, 404);
        }

        const {
            name,
            type_id,
            unit,
            quantity,
            minimum_quantity,
            status,
            description
        } = req.body;

        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (type_id !== undefined) updateData.type_id = parseInt(type_id, 10);
        if (unit !== undefined) updateData.unit = unit;
        if (quantity !== undefined) {
            updateData.quantity = parseInt(quantity, 10);
        }
        if (minimum_quantity !== undefined) {
            updateData.minimum_quantity = parseInt(minimum_quantity, 10);
        }
        if (description !== undefined) updateData.description = description;

        const effectiveQuantity = updateData.quantity ?? existing.quantity;
        const effectiveMinimumQuantity = updateData.minimum_quantity ?? existing.minimum_quantity;
        const effectiveStatusInput = status ?? existing.status;

        updateData.status = calculateConsumableStatus(
            effectiveQuantity,
            effectiveMinimumQuantity,
            effectiveStatusInput
        );

        const updated = await Consumable.update(id, updateData);

        sendSuccess(res, 'Consumible actualizado exitosamente', updated);
    } catch (error) {
        console.error('Error al actualizar consumible:', error);
        sendError(res, 'Error al actualizar consumible', null, 500);
    }
};

export const deleteConsumable = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;

        if (role !== 'administrator') {
            return sendError(res, 'Solo los administradores pueden eliminar consumibles', null, 403);
        }

        const existing = await Consumable.findById(id);
        if (!existing) {
            return sendError(res, 'Consumible no encontrado', null, 404);
        }

        await Consumable.delete(id);

        sendSuccess(res, 'Consumible eliminado exitosamente');
    } catch (error) {
        console.error('Error al eliminar consumible:', error);
        sendError(res, 'Error al eliminar consumible', null, 500);
    }
};

export const getConsumableStats = async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'administrator') {
            return sendError(res, 'Solo los administradores pueden ver estadísticas', null, 403);
        }

        const statsByStatus = await Consumable.getStats();
        const statsByType = await Consumable.getStatsByType();
        const total = await Consumable.count();

        sendSuccess(res, 'Estadísticas obtenidas exitosamente', {
            byStatus: statsByStatus,
            byType: statsByType,
            total
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de consumibles:', error);
        sendError(res, 'Error al obtener estadísticas de consumibles', null, 500);
    }
};

export const getConsumableTypes = async (req, res) => {
    try {
        const { query } = await import('../config/database.js');
        let sql = 'SELECT * FROM consumable_types WHERE active = TRUE ORDER BY name';

        try {
            const types = await query(sql);
            const mapped = types.map(type => ({
                value: type.name,
                label: type.name,
                id: type.id,
                description: type.description
            }));
            sendSuccess(res, 'Tipos de consumibles obtenidos exitosamente', mapped);
        } catch (error) {
            if (error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_NO_SUCH_TABLE') {
                return sendError(
                    res,
                    'La tabla de tipos de consumibles no existe o tiene columnas incorrectas',
                    null,
                    500
                );
            }
            throw error;
        }
    } catch (error) {
        console.error('Error al obtener tipos de consumibles:', error);
        sendError(res, 'Error al obtener tipos de consumibles', null, 500);
    }
};

export const getConsumableStatuses = async (req, res) => {
    try {
        const statuses = [
            { value: 'available', label: 'Disponible', color: 'bg-green-100' },
            { value: 'low_stock', label: 'Stock Bajo', color: 'bg-yellow-100' },
            { value: 'out_of_stock', label: 'Sin Stock', color: 'bg-red-100' },
            { value: 'inactive', label: 'Inactivo', color: 'bg-gray-100' }
        ];

        sendSuccess(res, 'Estados de consumibles obtenidos exitosamente', statuses);
    } catch (error) {
        console.error('Error al obtener estados de consumibles:', error);
        sendError(res, 'Error al obtener estados de consumibles', null, 500);
    }
};

