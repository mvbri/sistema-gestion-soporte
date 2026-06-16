import Ticket from '../models/Ticket.js';
import TicketComentario from '../models/TicketComentario.js';
import TicketHistorial from '../models/TicketHistorial.js';
import Usuario from '../models/Usuario.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { enviarEmailAsignacion } from '../config/email.js';
import { query } from '../config/database.js';

const buildTicketImagesFromRequest = (req) => {
    if (Array.isArray(req.cloudinaryImageUrls) && req.cloudinaryImageUrls.length > 0) {
        return req.cloudinaryImageUrls;
    }

    if (Array.isArray(req.files) && req.files.length > 0) {
        return req.files.map((file) => `/uploads/tickets/${file.filename}`);
    }

    if (req.file) {
        return [`/uploads/tickets/${req.file.filename}`];
    }

    if (req.body.imagen_url) {
        try {
            const parsed = JSON.parse(req.body.imagen_url);
            if (Array.isArray(parsed)) {
                return parsed;
            }
            return [req.body.imagen_url];
        } catch {
            return [req.body.imagen_url];
        }
    }

    return [];
};

const parseTicketImages = (rawValue) => {
    if (!rawValue) return [];

    if (Array.isArray(rawValue)) return rawValue;

    try {
        const parsed = JSON.parse(rawValue);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === 'string' && parsed.trim() !== '') return [parsed];
    } catch {
        if (typeof rawValue === 'string' && rawValue.trim() !== '') {
            return [rawValue];
        }
    }

    return [];
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const parseLocalDateOnly = (value) => {
    if (!value || typeof value !== 'string' || !ISO_DATE.test(value)) {
        return null;
    }
    const [y, m, d] = value.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
        return null;
    }
    return { y, m, d, value };
};

const daysBetweenInclusive = (a, b) => {
    const start = new Date(a.y, a.m - 1, a.d);
    const end = new Date(b.y, b.m - 1, b.d);
    return Math.floor((end - start) / 86400000) + 1;
};

const isLegacySchemaError = (error) =>
    error.code === 'ER_BAD_FIELD_ERROR' ||
    error.code === 'ER_NO_SUCH_TABLE' ||
    (error.message && error.message.includes('Unknown column'));

const queryWithLegacySql = async (modernSql, legacySql) => {
    try {
        return await query(modernSql);
    } catch (error) {
        if (!isLegacySchemaError(error)) {
            throw error;
        }
        return query(legacySql);
    }
};

const queryNameById = async (table, id) => {
    try {
        return await query(`SELECT name FROM ${table} WHERE id = ?`, [id]);
    } catch (error) {
        if (!isLegacySchemaError(error)) {
            throw error;
        }
        return query(`SELECT nombre as name FROM ${table} WHERE id = ?`, [id]);
    }
};

const queryIncidentAreaNameById = async (areaId) => {
    try {
        return await query('SELECT name FROM incident_areas WHERE id = ?', [areaId]);
    } catch (error) {
        if (!isLegacySchemaError(error)) {
            return [{ name: 'Desconocida' }];
        }
        try {
            return await query('SELECT nombre as name FROM incident_areas WHERE id = ?', [areaId]);
        } catch {
            return [{ name: 'Desconocida' }];
        }
    }
};

const parseEquipmentIdsValue = (equipmentIds) => {
    if (typeof equipmentIds === 'string') {
        try {
            return JSON.parse(equipmentIds);
        } catch {
            return equipmentIds
                .split(',')
                .map((id) => parseInt(id.trim(), 10))
                .filter((id) => !Number.isNaN(id));
        }
    }

    if (Array.isArray(equipmentIds)) {
        return equipmentIds.map((id) => parseInt(id, 10)).filter((id) => !Number.isNaN(id));
    }

    return [];
};

const parseEquipmentIdsFromBody = (equipmentIds) => {
    if (!equipmentIds) return null;
    return parseEquipmentIdsValue(equipmentIds);
};

const parseEquipmentIdsForUpdate = (equipmentIds) => {
    if (equipmentIds === undefined) return undefined;
    if (equipmentIds === null || equipmentIds === '') return [];
    return parseEquipmentIdsValue(equipmentIds);
};

const parseAssignedTechnicianId = (raw) => {
    if (raw === null || raw === '') return null;
    if (raw === undefined) return undefined;
    const parsed = typeof raw === 'number' ? raw : parseInt(raw, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

const applyTicketListRoleFilters = (filters, { role, userId, scope, assignedTechnicianId }) => {
    const scopeCreatedByMe = scope === 'created_by_me';

    if (role === 'end_user') {
        filters.created_by_user_id = userId;
        return;
    }

    if (role === 'technician' && scopeCreatedByMe) {
        filters.created_by_user_id = userId;
    }

    if (role === 'technician' && !scopeCreatedByMe) {
        filters.assigned_technician_id = userId;
    }

    if (role === 'administrator' && scopeCreatedByMe) {
        filters.created_by_user_id = userId;
    }

    if (role === 'administrator' && !scopeCreatedByMe && assignedTechnicianId) {
        filters.assigned_technician_id = parseInt(assignedTechnicianId, 10);
    }
};

const buildChangeDescription = (cambio) => {
    if (cambio.campo === 'state') {
        if (cambio.esAutoAsignado) {
            return `Estado cambiado automáticamente de "${cambio.anterior}" a "${cambio.nuevo}" al asignar técnico`;
        }
        return `Estado cambiado de "${cambio.anterior}" a "${cambio.nuevo}"`;
    }

    if (cambio.campo === 'assigned_technician') {
        if (cambio.nuevo === 'Sin asignar' || cambio.nuevo === '') {
            return 'Asignación removida';
        }
        return `Cambio de asignación a ${cambio.nuevo}`;
    }

    if (cambio.campo === 'category') {
        return `Categoría cambiada de "${cambio.anterior}" a "${cambio.nuevo}"`;
    }

    if (cambio.campo === 'priority') {
        return `Prioridad cambiada de "${cambio.anterior}" a "${cambio.nuevo}"`;
    }

    return `${cambio.campo} cambiado de "${cambio.anterior}" a "${cambio.nuevo}"`;
};

export const createTicket = async (req, res) => {
    try {
        const {
            title,
            description,
            category_id,
            priority_id,
            equipment_ids
        } = req.body;

        // Obtener dirección del usuario que crea el ticket
        const currentUser = await Usuario.findById(req.user.id);
        if (!currentUser || !currentUser.incident_area_id) {
            return sendError(
                res,
                'No tienes una Dirección configurada en tu perfil. Contacta al administrador o actualiza tu perfil.',
                null,
                400
            );
        }

        const imagenes = buildTicketImagesFromRequest(req);
        const image_url = imagenes.length > 0 ? JSON.stringify(imagenes) : null;

        const parsedEquipmentIds = parseEquipmentIdsFromBody(equipment_ids);

        const ticket = await Ticket.create({
            title,
            description,
            incident_area_id: Number(currentUser.incident_area_id),
            category_id: parseInt(category_id),
            priority_id: parseInt(priority_id),
            created_by_user_id: req.user.id,
            image_url,
            equipment_ids: parsedEquipmentIds
        });

        await TicketHistorial.create({
            ticket_id: ticket.id,
            user_id: req.user.id,
            change_type: 'CREATION',
            description: 'Ticket creado'
        });

        sendSuccess(res, 'Ticket creado exitosamente', ticket, 201);
    } catch (error) {
        console.error('Error al crear ticket:', error);
        sendError(res, 'Error al crear ticket', null, 500);
    }
};

/**
 * Obtiene la lista de tickets con filtros aplicados.
 * Los usuarios con rol 'end_user' solo ven tickets que ellos crearon (filtro fijo).
 * Los técnicos ven por defecto solo tickets asignados a ellos; con query scope=created_by_me
 * solo los que crearon (para listados secundarios en el cliente).
 * Los administradores ven todos los tickets por defecto; con scope=created_by_me solo los que
 * crearon, y con assigned_technician_id filtran por técnico asignado (p. ej. sus propios).
 */
export const getTickets = async (req, res) => {
    try {
        const { role, id } = req.user;
        const {
            state_id,
            category_id,
            priority_id,
            assigned_technician_id,
            search,
            date_from,
            date_to,
            page = 1,
            limit = 10
        } = req.query;

        const filters = {};
        applyTicketListRoleFilters(filters, {
            role,
            userId: id,
            scope: req.query.scope,
            assignedTechnicianId: assigned_technician_id
        });

        if (state_id) filters.state_id = parseInt(state_id);
        if (category_id) filters.category_id = parseInt(category_id);
        if (priority_id) filters.priority_id = parseInt(priority_id);
        if (search) filters.search = search;
        if (date_from) filters.date_from = date_from;
        if (date_to) filters.date_to = date_to;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        filters.limit = parseInt(limit);
        filters.offset = offset;

        const tickets = await Ticket.findAll(filters);
        const total = await Ticket.count(filters);

        sendSuccess(res, 'Tickets obtenidos exitosamente', {
            tickets,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error al obtener tickets:', error);
        sendError(res, 'Error al obtener tickets', null, 500);
    }
};

export const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, id: userId } = req.user;

        const ticket = await Ticket.findById(id);

        if (!ticket) {
            return sendError(res, 'Ticket no encontrado', null, 404);
        }

        if (role === 'end_user' && ticket.created_by_user_id !== userId) {
            return sendError(res, 'No tienes permiso para ver este ticket', null, 403);
        }

        if (role === 'technician') {
            const isAssigned = ticket.assigned_technician_id === userId;
            const isCreator = ticket.created_by_user_id === userId;
            if (!isAssigned && !isCreator) {
                return sendError(res, 'No tienes permiso para ver este ticket', null, 403);
            }
        }

        const comentarios = await TicketComentario.findByTicketId(id);
        const historial = await TicketHistorial.findByTicketId(id);

        const ticketConImagenes = {
            ...ticket,
            imagenes: parseTicketImages(ticket.image_url),
            equipment: ticket.equipment || []
        };

        sendSuccess(res, 'Ticket obtenido exitosamente', {
            ticket: ticketConImagenes,
            comentarios,
            historial
        });
    } catch (error) {
        console.error('Error al obtener ticket:', error);
        sendError(res, 'Error al obtener ticket', null, 500);
    }
};

export const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, id: userId } = req.user;

        if (role === 'end_user') {
            return sendError(res, 'No tienes permiso para actualizar tickets', null, 403);
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return sendError(res, 'Ticket no encontrado', null, 404);
        }

        const {
            title,
            description,
            incident_area_id: areaIncidenteIdRaw,
            category_id,
            priority_id,
            state_id: stateIdRaw,
            assigned_technician_id: assignedTechnicianIdRaw,
            equipment_ids
        } = req.body;

        console.log('Body recibido:', req.body);
        console.log('assigned_technician_id recibido:', assignedTechnicianIdRaw, typeof assignedTechnicianIdRaw);

        let state_id = stateIdRaw !== undefined ? parseInt(stateIdRaw, 10) : undefined;
        const assigned_technician_id = parseAssignedTechnicianId(assignedTechnicianIdRaw);
        
        console.log('assigned_technician_id procesado:', assigned_technician_id);

        if (role === 'technician') {
            if (ticket.assigned_technician_id !== userId) {
                return sendError(res, 'Solo puedes actualizar tickets asignados a ti', null, 403);
            }

            if (title !== undefined || description !== undefined || areaIncidenteIdRaw !== undefined ||
                category_id !== undefined || priority_id !== undefined || assigned_technician_id !== undefined) {
                return sendError(res, 'Como técnico, solo puedes modificar el estado del ticket', null, 403);
            }

            if (state_id === undefined) {
                return sendError(res, 'Debes especificar un estado', null, 400);
            }
        }

        const cambios = [];
        let estadoAutoAsignado = false;

        if (role === 'administrator') {
            if (title !== undefined && title !== ticket.title) {
                cambios.push({ campo: 'title', anterior: ticket.title, nuevo: title });
            }

            if (description !== undefined && description !== ticket.description) {
                cambios.push({ campo: 'description', anterior: ticket.description, nuevo: description });
            }

            if (areaIncidenteIdRaw !== undefined) {
                const areaIncidenteId = parseInt(areaIncidenteIdRaw, 10);
                if (areaIncidenteId !== ticket.incident_area_id) {
                    const areaAnterior = ticket.incident_area_name || 'Sin área';
                    const areaNueva = await queryIncidentAreaNameById(areaIncidenteId);
                    cambios.push({
                        campo: 'incident_area',
                        anterior: areaAnterior,
                        nuevo: areaNueva[0]?.name || 'Desconocida'
                    });
                }
            }

            if (category_id !== undefined && category_id !== ticket.category_id) {
                const categoriaAnterior = await queryNameById('ticket_categories', ticket.category_id);
                const categoriaNueva = await queryNameById('ticket_categories', category_id);
                cambios.push({
                    campo: 'category',
                    anterior: categoriaAnterior[0]?.name || '',
                    nuevo: categoriaNueva[0]?.name || ''
                });
            }

            if (priority_id !== undefined && priority_id !== ticket.priority_id) {
                const prioridadAnterior = await queryNameById('ticket_priorities', ticket.priority_id);
                const prioridadNueva = await queryNameById('ticket_priorities', priority_id);
                cambios.push({
                    campo: 'priority',
                    anterior: prioridadAnterior[0]?.name || '',
                    nuevo: prioridadNueva[0]?.name || ''
                });
            }

            if (assigned_technician_id !== undefined) {
                const tecnicoAnteriorId = ticket.assigned_technician_id;
                const tecnicoNuevoId = assigned_technician_id;
                
                if (tecnicoAnteriorId !== tecnicoNuevoId) {
                    const tecnicoAnterior = ticket.assigned_technician_name || 'Sin asignar';
                    let tecnicoNuevo = 'Sin asignar';
                    
                    if (tecnicoNuevoId) {
                        const tecnico = await Usuario.findById(tecnicoNuevoId);
                        tecnicoNuevo = tecnico?.full_name || 'Desconocido';
                        
                        if (tecnico && tecnico.email) {
                            try {
                                await enviarEmailAsignacion(
                                    tecnico.email,
                                    tecnico.full_name,
                                    ticket.title,
                                    ticket.id
                                );
                            } catch (emailError) {
                                console.error('Error al enviar email de asignación:', emailError);
                            }
                        }

                        if (ticket.state_id === 1 && (state_id === undefined || state_id === 1)) {
                            state_id = 2;
                            estadoAutoAsignado = true;
                            console.log(`Estado automáticamente cambiado a "Asignado" (2) para ticket ${id} al asignar técnico ${tecnicoNuevoId}`);
                        }
                    }

                    cambios.push({
                        campo: 'assigned_technician',
                        anterior: tecnicoAnterior,
                        nuevo: tecnicoNuevo
                    });
                }
            }
        }

        if (state_id !== undefined && state_id !== ticket.state_id) {
            const estadoAnterior = await queryNameById('ticket_states', ticket.state_id);
            const estadoNuevo = await queryNameById('ticket_states', state_id);
            cambios.push({
                campo: 'state',
                anterior: estadoAnterior[0]?.name || '',
                nuevo: estadoNuevo[0]?.name || '',
                esAutoAsignado: estadoAutoAsignado || false
            });
        }

        const incident_area_id = areaIncidenteIdRaw !== undefined ? parseInt(areaIncidenteIdRaw, 10) : undefined;
        const parsedEquipmentIds = parseEquipmentIdsForUpdate(equipment_ids);

        const updateData = {};

        if (role === 'administrator') {
            if (title !== undefined) updateData.title = title;
            if (description !== undefined) updateData.description = description;
            if (incident_area_id !== undefined) updateData.incident_area_id = incident_area_id;
            if (category_id !== undefined) updateData.category_id = parseInt(category_id, 10);
            if (priority_id !== undefined) updateData.priority_id = parseInt(priority_id, 10);
            if (state_id !== undefined) updateData.state_id = state_id;
            if (assigned_technician_id !== undefined) updateData.assigned_technician_id = assigned_technician_id;
            if (parsedEquipmentIds !== undefined) updateData.equipment_ids = parsedEquipmentIds;
        }

        if (role === 'technician' && state_id !== undefined) {
            updateData.state_id = state_id;
        }

        const updatedTicket = await Ticket.update(id, updateData);

        if (parsedEquipmentIds !== undefined && role === 'administrator') {
            const equipmentAnterior = ticket.equipment || [];
            const equipmentNuevo = updatedTicket.equipment || [];
            
            const nombresAnteriores = equipmentAnterior.map(eq => eq.name || `Equipo #${eq.id}`).join(', ') || 'Ninguno';
            const nombresNuevos = equipmentNuevo.map(eq => eq.name || `Equipo #${eq.id}`).join(', ') || 'Ninguno';
            
            if (nombresAnteriores !== nombresNuevos) {
                await TicketHistorial.create({
                    ticket_id: id,
                    user_id: userId,
                    change_type: 'UPDATE',
                    previous_field: nombresAnteriores,
                    new_field: nombresNuevos,
                    description: `Equipos asociados cambiados de "${nombresAnteriores}" a "${nombresNuevos}"`
                });
            }
        }

        for (const cambio of cambios) {
            const description = buildChangeDescription(cambio);

            await TicketHistorial.create({
                ticket_id: id,
                user_id: userId,
                change_type: 'UPDATE',
                previous_field: cambio.anterior,
                new_field: cambio.nuevo,
                description: description
            });
        }

        sendSuccess(res, 'Ticket actualizado exitosamente', updatedTicket);
    } catch (error) {
        console.error('Error al actualizar ticket:', error);
        sendError(res, 'Error al actualizar ticket', null, 500);
    }
};

export const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;

        if (role !== 'administrator') {
            return sendError(res, 'Solo los administradores pueden eliminar tickets', null, 403);
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return sendError(res, 'Ticket no encontrado', null, 404);
        }

        await Ticket.delete(id);

        sendSuccess(res, 'Ticket eliminado exitosamente');
    } catch (error) {
        console.error('Error al eliminar ticket:', error);
        sendError(res, 'Error al eliminar ticket', null, 500);
    }
};

export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const { id: userId } = req.user;

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return sendError(res, 'Ticket no encontrado', null, 404);
        }

        const { role, id: currentUserId } = req.user;
        if (role === 'end_user' && ticket.created_by_user_id !== currentUserId) {
            return sendError(res, 'No tienes permiso para comentar en este ticket', null, 403);
        }

        if (role === 'technician') {
            const isAssigned = ticket.assigned_technician_id === currentUserId;
            const isCreator = ticket.created_by_user_id === currentUserId;
            if (!isAssigned && !isCreator) {
                return sendError(res, 'No tienes permiso para comentar en este ticket', null, 403);
            }
        }

        const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const comentario = await TicketComentario.create({
            ticket_id: id,
            user_id: userId,
            content,
            created_at: fechaActual
        });

        sendSuccess(res, 'Comentario agregado exitosamente', comentario, 201);
    } catch (error) {
        console.error('Error al agregar comentario:', error);
        sendError(res, 'Error al agregar comentario', null, 500);
    }
};

export const getEstados = async (req, res) => {
    try {
        const estados = await queryWithLegacySql(
            'SELECT * FROM ticket_states WHERE active = TRUE ORDER BY `order`',
            'SELECT * FROM ticket_states WHERE activo = TRUE ORDER BY orden'
        );
        sendSuccess(res, 'Estados obtenidos exitosamente', estados);
    } catch (error) {
        console.error('Error al obtener estados:', error);
        sendError(res, 'Error al obtener estados', null, 500);
    }
};

export const getCategorias = async (req, res) => {
    try {
        const categorias = await queryWithLegacySql(
            'SELECT * FROM ticket_categories WHERE active = TRUE ORDER BY name',
            'SELECT * FROM ticket_categories WHERE activo = TRUE ORDER BY nombre'
        );
        sendSuccess(res, 'Categorías obtenidas exitosamente', categorias);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        sendError(res, 'Error al obtener categorías', null, 500);
    }
};

export const getPrioridades = async (req, res) => {
    try {
        const prioridades = await queryWithLegacySql(
            'SELECT * FROM ticket_priorities WHERE active = TRUE ORDER BY level',
            'SELECT * FROM ticket_priorities WHERE activo = TRUE ORDER BY nivel'
        );
        sendSuccess(res, 'Prioridades obtenidas exitosamente', prioridades);
    } catch (error) {
        console.error('Error al obtener prioridades:', error);
        sendError(res, 'Error al obtener prioridades', null, 500);
    }
};

export const getDirecciones = async (req, res) => {
    try {
        const direcciones = await queryWithLegacySql(
            'SELECT * FROM incident_areas WHERE active = TRUE ORDER BY name',
            'SELECT * FROM incident_areas WHERE activo = TRUE ORDER BY nombre'
        );
        sendSuccess(res, 'Direcciones obtenidas exitosamente', direcciones);
    } catch (error) {
        console.error('Error al obtener direcciones:', error);
        sendError(res, 'Error al obtener direcciones', null, 500);
    }
};

export const getTecnicos = async (req, res) => {
    try {
        const modernSql = `
            SELECT u.id, u.full_name, u.email, u.department
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name IN ('technician', 'administrator') AND u.active = TRUE
            ORDER BY u.full_name
        `;
        const legacySql = `
            SELECT u.id, u.full_name, u.email, u.department
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.nombre IN ('technician', 'administrator') AND u.active = TRUE
            ORDER BY u.full_name
        `;
        const tecnicos = await queryWithLegacySql(modernSql, legacySql);
        sendSuccess(res, 'Técnicos obtenidos exitosamente', tecnicos);
    } catch (error) {
        console.error('Error al obtener técnicos:', error);
        sendError(res, 'Error al obtener técnicos', null, 500);
    }
};

export const getStats = async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== 'administrator') {
            return sendError(res, 'Solo los administradores pueden ver estadísticas', null, 403);
        }

        const fromRaw = req.query.date_from ?? req.query.from;
        const toRaw = req.query.date_to ?? req.query.to;

        const today = new Date();
        const defaultTo = {
            y: today.getFullYear(),
            m: today.getMonth() + 1,
            d: today.getDate(),
            value: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        };
        const defaultFromDate = new Date(today);
        defaultFromDate.setDate(defaultFromDate.getDate() - 29);
        const defaultFrom = {
            y: defaultFromDate.getFullYear(),
            m: defaultFromDate.getMonth() + 1,
            d: defaultFromDate.getDate(),
            value: `${defaultFromDate.getFullYear()}-${String(defaultFromDate.getMonth() + 1).padStart(2, '0')}-${String(defaultFromDate.getDate()).padStart(2, '0')}`
        };

        const parsedFrom = fromRaw ? parseLocalDateOnly(String(fromRaw)) : defaultFrom;
        const parsedTo = toRaw ? parseLocalDateOnly(String(toRaw)) : defaultTo;

        if (!parsedFrom || !parsedTo) {
            return sendError(res, 'Las fechas deben tener formato YYYY-MM-DD', null, 400);
        }

        if (parsedFrom.value > parsedTo.value) {
            return sendError(res, 'La fecha inicial no puede ser posterior a la fecha final', null, 400);
        }

        const span = daysBetweenInclusive(parsedFrom, parsedTo);
        if (span > 366) {
            return sendError(res, 'El rango máximo permitido es de 366 días', null, 400);
        }

        const filters = {
            date_from: parsedFrom.value,
            date_to: parsedTo.value
        };

        const statsByEstado = await Ticket.getStats(filters);
        const statsByCategory = await Ticket.getStatsByCategory(filters);
        const statsByPriority = await Ticket.getStatsByPriority(filters);
        const statsByIncidentArea = await Ticket.getStatsByIncidentArea(filters);
        const totalTickets = await Ticket.count(filters);

        const mappedStatsByEstado = statsByEstado.map(stat => ({
            estado_id: stat.state_id,
            estado_nombre: stat.state_name,
            estado_color: stat.state_color,
            cantidad: stat.count || 0
        }));

        const mappedStatsByCategory = statsByCategory.map(stat => ({
            id: stat.id,
            nombre: stat.name,
            cantidad: stat.count || 0
        }));

        const mappedStatsByPriority = statsByPriority.map(stat => ({
            id: stat.id,
            nombre: stat.name,
            color: stat.color,
            cantidad: stat.count || 0
        }));

        const mappedStatsByIncidentArea = statsByIncidentArea.map(stat => ({
            id: stat.id,
            nombre: stat.name,
            cantidad: stat.count || 0
        }));

        sendSuccess(res, 'Estadísticas obtenidas exitosamente', {
            porEstado: mappedStatsByEstado,
            porCategoria: mappedStatsByCategory,
            porPrioridad: mappedStatsByPriority,
            porDireccion: mappedStatsByIncidentArea,
            total: totalTickets || 0,
            period: {
                date_from: parsedFrom.value,
                date_to: parsedTo.value
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        sendError(res, 'Error al obtener estadísticas', null, 500);
    }
};

export const startProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, id: userId } = req.user;

        if (role !== 'technician' && role !== 'administrator') {
            return sendError(res, 'Solo los técnicos pueden iniciar el progreso de un ticket', null, 403);
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return sendError(res, 'Ticket no encontrado', null, 404);
        }

        if (role === 'technician' && ticket.assigned_technician_id !== userId) {
            return sendError(res, 'Solo puedes iniciar el progreso de tickets asignados a ti', null, 403);
        }

        if (!ticket.assigned_technician_id) {
            return sendError(res, 'El ticket debe estar asignado a un técnico antes de iniciar el progreso', null, 400);
        }

        if (ticket.state_id === 1) {
            return sendError(res, 'No se puede iniciar progreso en un ticket "Abierto". El ticket debe estar "Asignado" primero', null, 400);
        }

        if (ticket.state_id === 3) {
            return sendError(res, 'El ticket ya está "En Proceso"', null, 400);
        }

        if (ticket.state_id === 4) {
            return sendError(res, 'No se puede iniciar progreso en un ticket "Resuelto"', null, 400);
        }

        if (ticket.state_id === 5) {
            return sendError(res, 'No se puede iniciar progreso en un ticket "Cerrado"', null, 400);
        }

        if (ticket.state_id !== 2) {
            return sendError(res, 'Solo se puede iniciar progreso desde el estado "Asignado"', null, 400);
        }

        const estadoAnterior = await query('SELECT name FROM ticket_states WHERE id = ?', [ticket.state_id]);
        const estadoNuevo = await query('SELECT name FROM ticket_states WHERE id = ?', [3]);

        const updatedTicket = await Ticket.update(id, { state_id: 3 });

        await TicketHistorial.create({
            ticket_id: id,
            user_id: userId,
            change_type: 'UPDATE',
            previous_field: estadoAnterior[0]?.name || '',
            new_field: estadoNuevo[0]?.name || '',
            description: `Estado cambiado de "${estadoAnterior[0]?.name || ''}" a "${estadoNuevo[0]?.name || ''}"`
        });

        sendSuccess(res, 'Ticket marcado como "En Proceso"', updatedTicket);
    } catch (error) {
        console.error('Error al iniciar progreso:', error);
        sendError(res, 'Error al iniciar progreso del ticket', null, 500);
    }
};

export const markAsResolved = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, id: userId } = req.user;

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return sendError(res, 'Ticket no encontrado', null, 404);
        }

        const isEndUser = role === 'end_user';
        const isTechnician = role === 'technician';
        const isAdmin = role === 'administrator';

        if (!isEndUser && !isTechnician && !isAdmin) {
            return sendError(res, 'No autorizado para marcar este ticket como resuelto', null, 403);
        }

        if (isEndUser && ticket.created_by_user_id !== userId) {
            return sendError(res, 'Solo puedes marcar como resueltos los tickets que creaste', null, 403);
        }

        if (isTechnician && ticket.assigned_technician_id !== userId) {
            return sendError(res, 'Solo puedes marcar como resueltos los tickets asignados a ti', null, 403);
        }

        if ((isTechnician || isAdmin) && !ticket.assigned_technician_id) {
            return sendError(res, 'El ticket debe estar asignado a un técnico', null, 400);
        }

        if (ticket.state_id === 4) {
            return sendError(res, 'El ticket ya está marcado como "Resuelto"', null, 400);
        }

        if (ticket.state_id === 5) {
            return sendError(res, 'No se puede marcar como resuelto un ticket "Cerrado"', null, 400);
        }

        if (ticket.state_id === 1) {
            return sendError(
                res,
                isEndUser
                    ? 'No se puede marcar como resuelto un ticket "Abierto". Debe estar asignado o en proceso primero'
                    : 'No se puede marcar como resuelto un ticket "Abierto". Debe estar "Asignado" y "En Proceso" primero',
                null,
                400
            );
        }

        if (isEndUser && ticket.state_id !== 2 && ticket.state_id !== 3) {
            return sendError(
                res,
                'Solo puedes marcar como resuelto un ticket asignado o en proceso',
                null,
                400
            );
        }

        if (!isEndUser && ticket.state_id === 2) {
            return sendError(res, 'No se puede marcar como resuelto un ticket "Asignado". Debe estar "En Proceso" primero', null, 400);
        }

        if (!isEndUser && ticket.state_id !== 3) {
            return sendError(res, 'Solo se puede marcar como resuelto un ticket que está "En Proceso"', null, 400);
        }

        const estadoAnterior = await query('SELECT name FROM ticket_states WHERE id = ?', [ticket.state_id]);
        const estadoNuevo = await query('SELECT name FROM ticket_states WHERE id = ?', [4]);

        const updatedTicket = await Ticket.update(id, { state_id: 4 });

        await TicketHistorial.create({
            ticket_id: id,
            user_id: userId,
            change_type: 'UPDATE',
            previous_field: estadoAnterior[0]?.name || '',
            new_field: estadoNuevo[0]?.name || '',
            description: `Estado cambiado de "${estadoAnterior[0]?.name || ''}" a "${estadoNuevo[0]?.name || ''}"`
        });

        sendSuccess(res, 'Ticket marcado como "Resuelto"', updatedTicket);
    } catch (error) {
        console.error('Error al marcar como resuelto:', error);
        sendError(res, 'Error al marcar ticket como resuelto', null, 500);
    }
};