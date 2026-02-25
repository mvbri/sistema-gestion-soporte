import Tool from '../models/Tool.js';
import Usuario from '../models/Usuario.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

const TOOL_TABLE_MISSING_MESSAGE = 'La tabla de herramientas no existe. Ejecuta la migración correspondiente a tools';

export const createTool = async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'administrator') {
            return sendError(res, 'No tienes permiso para crear herramientas', null, 403);
        }

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
        } = req.body;

        if (assigned_to_user_id) {
            const user = await Usuario.findById(assigned_to_user_id);
            if (!user) {
                return sendError(res, 'Usuario asignado no encontrado', null, 404);
            }
        }

        const tool = await Tool.create({
            name,
            code,
            type_id: type_id ? parseInt(type_id, 10) : undefined,
            type: type || undefined,
            status: assigned_to_user_id ? 'assigned' : (status || 'available'),
            condition: condition || 'good',
            location,
            assigned_to_user_id: assigned_to_user_id || null,
            description
        });

        sendSuccess(res, 'Herramienta creada exitosamente', tool, 201);
    } catch (error) {
        console.error('Error al crear herramienta:', error);
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return sendError(res, TOOL_TABLE_MISSING_MESSAGE, null, 500);
        }
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'El código de herramienta ya existe', null, 400);
        }
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            return sendError(
                res,
                `Error en la estructura de la base de datos: ${error.message}`,
                null,
                500
            );
        }
        sendError(res, `Error al crear herramienta: ${error.message || 'Error desconocido'}`, null, 500);
    }
};

export const getTools = async (req, res) => {
    try {
        const {
            status,
            type,
            assigned_to_user_id,
            search,
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

        if (assigned_to_user_id) {
            filters.assigned_to_user_id = parseInt(assigned_to_user_id, 10);
        }

        if (search) {
            filters.search = search;
        }

        const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        filters.limit = parseInt(limit, 10);
        filters.offset = offset;

        const tools = await Tool.findAll(filters);
        const total = await Tool.count(filters);

        sendSuccess(res, 'Herramientas obtenidas exitosamente', {
            tools,
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                total,
                totalPages: Math.ceil(total / parseInt(limit, 10))
            }
        });
    } catch (error) {
        console.error('Error al obtener herramientas:', error);
        sendError(res, 'Error al obtener herramientas', null, 500);
    }
};

export const getToolById = async (req, res) => {
    try {
        const { id } = req.params;

        const tool = await Tool.findById(id);

        if (!tool) {
            return sendError(res, 'Herramienta no encontrada', null, 404);
        }

        sendSuccess(res, 'Herramienta obtenida exitosamente', tool);
    } catch (error) {
        console.error('Error al obtener herramienta:', error);
        sendError(res, 'Error al obtener herramienta', null, 500);
    }
};

export const updateTool = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;

        if (role !== 'administrator') {
            return sendError(res, 'No tienes permiso para actualizar herramientas', null, 403);
        }

        const existing = await Tool.findById(id);
        if (!existing) {
            return sendError(res, 'Herramienta no encontrada', null, 404);
        }

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
        } = req.body;

        if (assigned_to_user_id !== undefined && assigned_to_user_id !== null) {
            const user = await Usuario.findById(assigned_to_user_id);
            if (!user) {
                return sendError(res, 'Usuario asignado no encontrado', null, 404);
            }
        }

        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (code !== undefined) updateData.code = code;
        if (type_id !== undefined) {
            updateData.type_id = parseInt(type_id, 10);
        } else if (type !== undefined) {
            updateData.type = type;
        }
        if (status !== undefined) updateData.status = status;
        if (condition !== undefined) updateData.condition = condition;
        if (location !== undefined) updateData.location = location;
        if (assigned_to_user_id !== undefined) {
            updateData.assigned_to_user_id = assigned_to_user_id;
            if (assigned_to_user_id) {
                updateData.status = 'assigned';
            } else if (status === undefined) {
                updateData.status = 'available';
            }
        }
        if (description !== undefined) updateData.description = description;

        const updated = await Tool.update(id, updateData);

        sendSuccess(res, 'Herramienta actualizada exitosamente', updated);
    } catch (error) {
        console.error('Error al actualizar herramienta:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'El código de herramienta ya existe', null, 400);
        }
        sendError(res, 'Error al actualizar herramienta', null, 500);
    }
};

export const deleteTool = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;

        if (role !== 'administrator') {
            return sendError(res, 'Solo los administradores pueden eliminar herramientas', null, 403);
        }

        const existing = await Tool.findById(id);
        if (!existing) {
            return sendError(res, 'Herramienta no encontrada', null, 404);
        }

        await Tool.delete(id);

        sendSuccess(res, 'Herramienta eliminada exitosamente');
    } catch (error) {
        console.error('Error al eliminar herramienta:', error);
        sendError(res, 'Error al eliminar herramienta', null, 500);
    }
};

export const assignTool = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;
        const { role } = req.user;

        if (role !== 'administrator' && role !== 'technician') {
            return sendError(res, 'No tienes permiso para asignar herramientas', null, 403);
        }

        const tool = await Tool.findById(id);
        if (!tool) {
            return sendError(res, 'Herramienta no encontrada', null, 404);
        }

        if (!user_id) {
            return sendError(res, 'El ID del usuario es requerido', null, 400);
        }

        const user = await Usuario.findById(user_id);
        if (!user) {
            return sendError(res, 'Usuario no encontrado', null, 404);
        }

        const assignedTool = await Tool.assignToUser(id, user_id);

        sendSuccess(res, 'Herramienta asignada exitosamente', assignedTool);
    } catch (error) {
        console.error('Error al asignar herramienta:', error);
        sendError(res, 'Error al asignar herramienta', null, 500);
    }
};

export const unassignTool = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;

        if (role !== 'administrator' && role !== 'technician') {
            return sendError(res, 'No tienes permiso para desasignar herramientas', null, 403);
        }

        const tool = await Tool.findById(id);
        if (!tool) {
            return sendError(res, 'Herramienta no encontrada', null, 404);
        }

        const unassignedTool = await Tool.unassign(id);

        sendSuccess(res, 'Herramienta desasignada exitosamente', unassignedTool);
    } catch (error) {
        console.error('Error al desasignar herramienta:', error);
        sendError(res, 'Error al desasignar herramienta', null, 500);
    }
};

export const getToolStats = async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'administrator') {
            return sendError(res, 'Solo los administradores pueden ver estadísticas de herramientas', null, 403);
        }

        const statsByStatus = await Tool.getStats();
        const statsByType = await Tool.getStatsByType();
        const total = await Tool.count();

        sendSuccess(res, 'Estadísticas de herramientas obtenidas exitosamente', {
            byStatus: statsByStatus,
            byType: statsByType,
            total
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de herramientas:', error);
        sendError(res, 'Error al obtener estadísticas de herramientas', null, 500);
    }
};

export const getToolTypes = async (req, res) => {
    try {
        const { query } = await import('../config/database.js');
        let sql = 'SELECT * FROM tool_types WHERE active = TRUE ORDER BY name';

        try {
            const types = await query(sql);
            const mapped = types.map(type => ({
                value: type.name,
                label: type.name,
                id: type.id,
                description: type.description
            }));
            sendSuccess(res, 'Tipos de herramientas obtenidos exitosamente', mapped);
        } catch (error) {
            if (error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_NO_SUCH_TABLE') {
                return sendError(
                    res,
                    'La tabla de tipos de herramientas no existe o tiene columnas incorrectas',
                    null,
                    500
                );
            }
            throw error;
        }
    } catch (error) {
        console.error('Error al obtener tipos de herramientas:', error);
        sendError(res, 'Error al obtener tipos de herramientas', null, 500);
    }
};

export const getToolStatuses = async (req, res) => {
    try {
        const statuses = [
            { value: 'available', label: 'Disponible', color: 'bg-green-100' },
            { value: 'assigned', label: 'Asignada', color: 'bg-blue-100' },
            { value: 'maintenance', label: 'En Mantenimiento', color: 'bg-yellow-100' },
            { value: 'lost', label: 'Perdida', color: 'bg-red-100' },
            { value: 'retired', label: 'Retirada', color: 'bg-gray-100' }
        ];

        sendSuccess(res, 'Estados de herramientas obtenidos exitosamente', statuses);
    } catch (error) {
        console.error('Error al obtener estados de herramientas:', error);
        sendError(res, 'Error al obtener estados de herramientas', null, 500);
    }
};

