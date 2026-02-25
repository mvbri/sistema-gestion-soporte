import Equipment from '../models/Equipment.js';
import Usuario from '../models/Usuario.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const createEquipment = async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'administrator') {
            return sendError(res, 'No tienes permiso para crear equipos', null, 403);
        }

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
        } = req.body;

        if (!name) {
            return sendError(res, 'El nombre del equipo es requerido', null, 400);
        }

        if (assigned_to_user_id) {
            const user = await Usuario.findById(assigned_to_user_id);
            if (!user) {
                return sendError(res, 'Usuario asignado no encontrado', null, 404);
            }
        }

        const equipment = await Equipment.create({
            name,
            brand,
            model,
            serial_number,
            type_id: type_id ? parseInt(type_id) : undefined,
            type: type || undefined,
            status: assigned_to_user_id ? 'assigned' : (status || 'available'),
            location,
            assigned_to_user_id: assigned_to_user_id || null,
            description,
            purchase_date,
            warranty_expires_at
        });

        sendSuccess(res, 'Equipo creado exitosamente', equipment, 201);
    } catch (error) {
        console.error('Error al crear equipo:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'El número de serie ya existe', null, 400);
        }
        if (error.code === 'ER_NO_SUCH_TABLE') {
            return sendError(res, 'La tabla de equipos no existe. Ejecuta la migración: migration_add_equipment.sql', null, 500);
        }
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            return sendError(res, `Error en la estructura de la base de datos: ${error.message}`, null, 500);
        }
        sendError(res, `Error al crear equipo: ${error.message || 'Error desconocido'}`, null, 500);
    }
};

export const getEquipment = async (req, res) => {
    try {
        const { role, id: userId } = req.user;
        const {
            status,
            type,
            assigned_to_user_id,
            search,
            page = 1,
            limit = 10
        } = req.query;

        const filters = {};

        if (role === 'end_user') {
            filters.status = 'available';
        } else {
            if (status) filters.status = status;
            if (type) filters.type = type;
            if (assigned_to_user_id) filters.assigned_to_user_id = parseInt(assigned_to_user_id);
        }

        if (search) filters.search = search;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        filters.limit = parseInt(limit);
        filters.offset = offset;

        const equipment = await Equipment.findAll(filters);
        const total = await Equipment.count(filters);

        sendSuccess(res, 'Equipos obtenidos exitosamente', {
            equipment,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error al obtener equipos:', error);
        sendError(res, 'Error al obtener equipos', null, 500);
    }
};

export const getEquipmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;

        const equipment = await Equipment.findById(id);

        if (!equipment) {
            return sendError(res, 'Equipo no encontrado', null, 404);
        }

        if (role === 'end_user' && equipment.status !== 'available') {
            return sendError(res, 'No tienes permiso para ver este equipo', null, 403);
        }

        sendSuccess(res, 'Equipo obtenido exitosamente', equipment);
    } catch (error) {
        console.error('Error al obtener equipo:', error);
        sendError(res, 'Error al obtener equipo', null, 500);
    }
};

export const updateEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;

        if (role !== 'administrator') {
            return sendError(res, 'No tienes permiso para actualizar equipos', null, 403);
        }

        const equipment = await Equipment.findById(id);
        if (!equipment) {
            return sendError(res, 'Equipo no encontrado', null, 404);
        }

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
        } = req.body;

        if (assigned_to_user_id !== undefined && assigned_to_user_id !== null) {
            const user = await Usuario.findById(assigned_to_user_id);
            if (!user) {
                return sendError(res, 'Usuario asignado no encontrado', null, 404);
            }
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (brand !== undefined) updateData.brand = brand;
        if (model !== undefined) updateData.model = model;
        if (serial_number !== undefined) updateData.serial_number = serial_number;
        if (type_id !== undefined) {
            updateData.type_id = parseInt(type_id);
        } else if (type !== undefined) {
            updateData.type = type;
        }
        if (status !== undefined) updateData.status = status;
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
        if (purchase_date !== undefined) updateData.purchase_date = purchase_date;
        if (warranty_expires_at !== undefined) updateData.warranty_expires_at = warranty_expires_at;

        const updatedEquipment = await Equipment.update(id, updateData);

        sendSuccess(res, 'Equipo actualizado exitosamente', updatedEquipment);
    } catch (error) {
        console.error('Error al actualizar equipo:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'El número de serie ya existe', null, 400);
        }
        sendError(res, 'Error al actualizar equipo', null, 500);
    }
};

export const deleteEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;

        if (role !== 'administrator') {
            return sendError(res, 'Solo los administradores pueden eliminar equipos', null, 403);
        }

        const equipment = await Equipment.findById(id);
        if (!equipment) {
            return sendError(res, 'Equipo no encontrado', null, 404);
        }

        await Equipment.delete(id);

        sendSuccess(res, 'Equipo eliminado exitosamente');
    } catch (error) {
        console.error('Error al eliminar equipo:', error);
        sendError(res, 'Error al eliminar equipo', null, 500);
    }
};

export const assignEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;
        const { role } = req.user;

        if (role !== 'administrator' && role !== 'technician') {
            return sendError(res, 'No tienes permiso para asignar equipos', null, 403);
        }

        const equipment = await Equipment.findById(id);
        if (!equipment) {
            return sendError(res, 'Equipo no encontrado', null, 404);
        }

        if (equipment.status === 'maintenance') {
            return sendError(res, 'No se puede asignar un equipo en mantenimiento', null, 400);
        }

        if (equipment.status === 'retired') {
            return sendError(res, 'No se puede asignar un equipo retirado', null, 400);
        }

        if (!user_id) {
            return sendError(res, 'El ID del usuario es requerido', null, 400);
        }

        const user = await Usuario.findById(user_id);
        if (!user) {
            return sendError(res, 'Usuario no encontrado', null, 404);
        }

        const assignedEquipment = await Equipment.assignToUser(id, user_id);

        sendSuccess(res, 'Equipo asignado exitosamente', assignedEquipment);
    } catch (error) {
        console.error('Error al asignar equipo:', error);
        sendError(res, 'Error al asignar equipo', null, 500);
    }
};

export const unassignEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;

        if (role !== 'administrator' && role !== 'technician') {
            return sendError(res, 'No tienes permiso para desasignar equipos', null, 403);
        }

        const equipment = await Equipment.findById(id);
        if (!equipment) {
            return sendError(res, 'Equipo no encontrado', null, 404);
        }

        const unassignedEquipment = await Equipment.unassign(id);

        sendSuccess(res, 'Equipo desasignado exitosamente', unassignedEquipment);
    } catch (error) {
        console.error('Error al desasignar equipo:', error);
        sendError(res, 'Error al desasignar equipo', null, 500);
    }
};

export const getEquipmentStats = async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'administrator') {
            return sendError(res, 'Solo los administradores pueden ver estadísticas', null, 403);
        }

        const statsByStatus = await Equipment.getStats();
        const statsByType = await Equipment.getStatsByType();
        const total = await Equipment.count();

        sendSuccess(res, 'Estadísticas obtenidas exitosamente', {
            byStatus: statsByStatus,
            byType: statsByType,
            total
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        sendError(res, 'Error al obtener estadísticas', null, 500);
    }
};

export const getEquipmentTypes = async (req, res) => {
    try {
        const { query } = await import('../config/database.js');
        let sql = 'SELECT * FROM equipment_types WHERE active = TRUE ORDER BY name';
        try {
            const tipos = await query(sql);
            const types = tipos.map(tipo => ({
                value: tipo.name,
                label: tipo.name,
                id: tipo.id,
                description: tipo.description
            }));
            sendSuccess(res, 'Tipos obtenidos exitosamente', types);
        } catch (error) {
            if (error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_NO_SUCH_TABLE') {
                sql = 'SELECT * FROM equipment_types WHERE activo = TRUE ORDER BY nombre';
                const tipos = await query(sql);
                const types = tipos.map(tipo => ({
                    value: tipo.nombre || tipo.name,
                    label: tipo.nombre || tipo.name,
                    id: tipo.id,
                    description: tipo.descripcion || tipo.description
                }));
                sendSuccess(res, 'Tipos obtenidos exitosamente', types);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error al obtener tipos:', error);
        sendError(res, 'Error al obtener tipos', null, 500);
    }
};

export const getEquipmentStatuses = async (req, res) => {
    try {
        const statuses = [
            { value: 'available', label: 'Disponible', color: 'bg-green-100' },
            { value: 'assigned', label: 'Asignado', color: 'bg-blue-100' },
            { value: 'maintenance', label: 'En Mantenimiento', color: 'bg-yellow-100' },
            { value: 'retired', label: 'Retirado', color: 'bg-gray-100' }
        ];

        sendSuccess(res, 'Estados obtenidos exitosamente', statuses);
    } catch (error) {
        console.error('Error al obtener estados:', error);
        sendError(res, 'Error al obtener estados', null, 500);
    }
};
