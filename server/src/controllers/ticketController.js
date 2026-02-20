import Ticket from '../models/Ticket.js';
import TicketComentario from '../models/TicketComentario.js';
import TicketHistorial from '../models/TicketHistorial.js';
import Usuario from '../models/Usuario.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { enviarEmailAsignacion } from '../config/email.js';
import { query } from '../config/database.js';

const buildTicketImagesFromRequest = (req) => {
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

export const createTicket = async (req, res) => {
    try {
        const {
            titulo,
            descripcion,
            area_incidente,
            categoria_id,
            prioridad_id
        } = req.body;

        const imagenes = buildTicketImagesFromRequest(req);
        const imagen_url = imagenes.length > 0 ? JSON.stringify(imagenes) : null;

        const ticket = await Ticket.create({
            titulo,
            descripcion,
            area_incidente,
            categoria_id,
            prioridad_id,
            usuario_creador_id: req.user.id,
            imagen_url
        });

        await TicketHistorial.create({
            ticket_id: ticket.id,
            usuario_id: req.user.id,
            tipo_cambio: 'CREACION',
            descripcion: 'Ticket creado'
        });

        sendSuccess(res, 'Ticket creado exitosamente', ticket, 201);
    } catch (error) {
        console.error('Error al crear ticket:', error);
        sendError(res, 'Error al crear ticket', null, 500);
    }
};

/**
 * Obtiene la lista de tickets con filtros aplicados.
 * Los usuarios con rol 'end_user' (Colaboradores) solo pueden ver sus propios tickets.
 * Este filtro se aplica automáticamente y no puede ser anulado.
 */
export const getTickets = async (req, res) => {
    try {
        const { role, id } = req.user;
        const {
            estado_id,
            categoria_id,
            prioridad_id,
            tecnico_asignado_id,
            busqueda,
            fecha_desde,
            fecha_hasta,
            page = 1,
            limit = 10
        } = req.query;

        const filters = {};

        if (role === 'end_user') {
            filters.usuario_creador_id = id;
        }

        if (tecnico_asignado_id && (role === 'administrator' || role === 'technician')) {
            filters.tecnico_asignado_id = parseInt(tecnico_asignado_id);
        }

        if (estado_id) filters.estado_id = parseInt(estado_id);
        if (categoria_id) filters.categoria_id = parseInt(categoria_id);
        if (prioridad_id) filters.prioridad_id = parseInt(prioridad_id);
        if (busqueda) filters.busqueda = busqueda;
        if (fecha_desde) filters.fecha_desde = fecha_desde;
        if (fecha_hasta) filters.fecha_hasta = fecha_hasta;

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

        if (role === 'end_user' && ticket.usuario_creador_id !== userId) {
            return sendError(res, 'No tienes permiso para ver este ticket', null, 403);
        }

        const comentarios = await TicketComentario.findByTicketId(id);
        const historial = await TicketHistorial.findByTicketId(id);

        const ticketConImagenes = {
            ...ticket,
            imagenes: parseTicketImages(ticket.imagen_url)
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
            titulo,
            descripcion,
            area_incidente,
            categoria_id,
            prioridad_id,
            estado_id: estadoIdRaw,
            tecnico_asignado_id: tecnicoAsignadoIdRaw
        } = req.body;

        const estado_id = estadoIdRaw !== undefined ? parseInt(estadoIdRaw, 10) : undefined;
        const tecnico_asignado_id = tecnicoAsignadoIdRaw !== undefined && tecnicoAsignadoIdRaw !== null 
            ? parseInt(tecnicoAsignadoIdRaw, 10) 
            : tecnicoAsignadoIdRaw;

        if (role === 'technician') {
            if (ticket.tecnico_asignado_id !== userId) {
                return sendError(res, 'Solo puedes actualizar tickets asignados a ti', null, 403);
            }

            if (titulo !== undefined || descripcion !== undefined || area_incidente !== undefined ||
                categoria_id !== undefined || prioridad_id !== undefined || tecnico_asignado_id !== undefined) {
                return sendError(res, 'Como técnico, solo puedes modificar el estado del ticket', null, 403);
            }

            if (estado_id === undefined) {
                return sendError(res, 'Debes especificar un estado', null, 400);
            }
        }

        const cambios = [];
        const historialEntries = [];
        let estadoAutoAsignado = false;

        if (role === 'administrator') {
            if (titulo !== undefined && titulo !== ticket.titulo) {
                cambios.push({ campo: 'titulo', anterior: ticket.titulo, nuevo: titulo });
            }

            if (descripcion !== undefined && descripcion !== ticket.descripcion) {
                cambios.push({ campo: 'descripcion', anterior: ticket.descripcion, nuevo: descripcion });
            }

            if (area_incidente !== undefined && area_incidente !== ticket.area_incidente) {
                cambios.push({ campo: 'area_incidente', anterior: ticket.area_incidente, nuevo: area_incidente });
            }

            if (categoria_id !== undefined && categoria_id !== ticket.categoria_id) {
                const categoriaAnterior = await query('SELECT nombre FROM categorias_ticket WHERE id = ?', [ticket.categoria_id]);
                const categoriaNueva = await query('SELECT nombre FROM categorias_ticket WHERE id = ?', [categoria_id]);
                cambios.push({
                    campo: 'categoria',
                    anterior: categoriaAnterior[0]?.nombre || '',
                    nuevo: categoriaNueva[0]?.nombre || ''
                });
            }

            if (prioridad_id !== undefined && prioridad_id !== ticket.prioridad_id) {
                const prioridadAnterior = await query('SELECT nombre FROM prioridades_ticket WHERE id = ?', [ticket.prioridad_id]);
                const prioridadNueva = await query('SELECT nombre FROM prioridades_ticket WHERE id = ?', [prioridad_id]);
                cambios.push({
                    campo: 'prioridad',
                    anterior: prioridadAnterior[0]?.nombre || '',
                    nuevo: prioridadNueva[0]?.nombre || ''
                });
            }

            if (tecnico_asignado_id !== undefined && tecnico_asignado_id !== ticket.tecnico_asignado_id) {
                const tecnicoAnterior = ticket.tecnico_asignado_nombre || 'Sin asignar';
                let tecnicoNuevo = 'Sin asignar';
                
                if (tecnico_asignado_id) {
                    const tecnico = await Usuario.findById(tecnico_asignado_id);
                    tecnicoNuevo = tecnico?.full_name || 'Desconocido';
                    
                    if (tecnico && tecnico.email) {
                        try {
                            await enviarEmailAsignacion(
                                tecnico.email,
                                tecnico.full_name,
                                ticket.titulo,
                                ticket.id
                            );
                        } catch (emailError) {
                            console.error('Error al enviar email de asignación:', emailError);
                        }
                    }

                    if (ticket.estado_id === 1 && (estado_id === undefined || estado_id === 1)) {
                        estado_id = 2;
                        estadoAutoAsignado = true;
                        console.log(`Estado automáticamente cambiado a "Asignado" (2) para ticket ${id} al asignar técnico ${tecnico_asignado_id}`);
                    }
                }

                cambios.push({
                    campo: 'tecnico_asignado',
                    anterior: tecnicoAnterior,
                    nuevo: tecnicoNuevo
                });
            }
        }

        if (estado_id !== undefined && estado_id !== ticket.estado_id) {
            const estadoAnterior = await query('SELECT nombre FROM estados_ticket WHERE id = ?', [ticket.estado_id]);
            const estadoNuevo = await query('SELECT nombre FROM estados_ticket WHERE id = ?', [estado_id]);
            cambios.push({
                campo: 'estado',
                anterior: estadoAnterior[0]?.nombre || '',
                nuevo: estadoNuevo[0]?.nombre || ''
            });
        }

        const updateData = role === 'administrator' ? {
            titulo,
            descripcion,
            area_incidente,
            categoria_id,
            prioridad_id,
            estado_id,
            tecnico_asignado_id
        } : {
            estado_id
        };

        const updatedTicket = await Ticket.update(id, updateData);

        for (const cambio of cambios) {
            await TicketHistorial.create({
                ticket_id: id,
                usuario_id: userId,
                tipo_cambio: 'ACTUALIZACION',
                campo_anterior: cambio.anterior,
                campo_nuevo: cambio.nuevo,
                descripcion: `${cambio.campo} cambiado de "${cambio.anterior}" a "${cambio.nuevo}"`
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
        const { contenido } = req.body;
        const { id: userId } = req.user;

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return sendError(res, 'Ticket no encontrado', null, 404);
        }

        const { role, id: currentUserId } = req.user;
        if (role === 'end_user' && ticket.usuario_creador_id !== currentUserId) {
            return sendError(res, 'No tienes permiso para comentar en este ticket', null, 403);
        }

        const fechaActual = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const comentario = await TicketComentario.create({
            ticket_id: id,
            usuario_id: userId,
            contenido,
            fecha_creacion: fechaActual
        });

        sendSuccess(res, 'Comentario agregado exitosamente', comentario, 201);
    } catch (error) {
        console.error('Error al agregar comentario:', error);
        sendError(res, 'Error al agregar comentario', null, 500);
    }
};

export const getEstados = async (req, res) => {
    try {
        const sql = 'SELECT * FROM estados_ticket WHERE activo = TRUE ORDER BY orden';
        const estados = await query(sql);
        sendSuccess(res, 'Estados obtenidos exitosamente', estados);
    } catch (error) {
        console.error('Error al obtener estados:', error);
        sendError(res, 'Error al obtener estados', null, 500);
    }
};

export const getCategorias = async (req, res) => {
    try {
        const sql = 'SELECT * FROM categorias_ticket WHERE activo = TRUE ORDER BY nombre';
        const categorias = await query(sql);
        sendSuccess(res, 'Categorías obtenidas exitosamente', categorias);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        sendError(res, 'Error al obtener categorías', null, 500);
    }
};

export const getPrioridades = async (req, res) => {
    try {
        const sql = 'SELECT * FROM prioridades_ticket WHERE activo = TRUE ORDER BY nivel';
        const prioridades = await query(sql);
        sendSuccess(res, 'Prioridades obtenidas exitosamente', prioridades);
    } catch (error) {
        console.error('Error al obtener prioridades:', error);
        sendError(res, 'Error al obtener prioridades', null, 500);
    }
};

export const getTecnicos = async (req, res) => {
    try {
        const sql = `
            SELECT u.id, u.full_name, u.email, u.department
            FROM usuarios u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name IN ('technician', 'administrator') AND u.active = TRUE
            ORDER BY u.full_name
        `;
        const tecnicos = await query(sql);
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

        const statsByEstado = await Ticket.getStats();
        const statsByCategory = await Ticket.getStatsByCategory();
        const statsByPriority = await Ticket.getStatsByPriority();
        const totalTickets = await Ticket.count();

        sendSuccess(res, 'Estadísticas obtenidas exitosamente', {
            porEstado: statsByEstado,
            porCategoria: statsByCategory,
            porPrioridad: statsByPriority,
            total: totalTickets
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

        if (role === 'technician' && ticket.tecnico_asignado_id !== userId) {
            return sendError(res, 'Solo puedes iniciar el progreso de tickets asignados a ti', null, 403);
        }

        if (!ticket.tecnico_asignado_id) {
            return sendError(res, 'El ticket debe estar asignado a un técnico antes de iniciar el progreso', null, 400);
        }

        if (ticket.estado_id === 1) {
            return sendError(res, 'No se puede iniciar progreso en un ticket "Abierto". El ticket debe estar "Asignado" primero', null, 400);
        }

        if (ticket.estado_id === 3) {
            return sendError(res, 'El ticket ya está "En Proceso"', null, 400);
        }

        if (ticket.estado_id === 4) {
            return sendError(res, 'No se puede iniciar progreso en un ticket "Resuelto"', null, 400);
        }

        if (ticket.estado_id === 5) {
            return sendError(res, 'No se puede iniciar progreso en un ticket "Cerrado"', null, 400);
        }

        if (ticket.estado_id !== 2) {
            return sendError(res, 'Solo se puede iniciar progreso desde el estado "Asignado"', null, 400);
        }

        const estadoAnterior = await query('SELECT nombre FROM estados_ticket WHERE id = ?', [ticket.estado_id]);
        const estadoNuevo = await query('SELECT nombre FROM estados_ticket WHERE id = ?', [3]);

        const updatedTicket = await Ticket.update(id, { estado_id: 3 });

        await TicketHistorial.create({
            ticket_id: id,
            usuario_id: userId,
            tipo_cambio: 'ACTUALIZACION',
            campo_anterior: estadoAnterior[0]?.nombre || '',
            campo_nuevo: estadoNuevo[0]?.nombre || '',
            descripcion: `Estado cambiado de "${estadoAnterior[0]?.nombre || ''}" a "${estadoNuevo[0]?.nombre || ''}"`
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

        if (role !== 'technician' && role !== 'administrator') {
            return sendError(res, 'Solo los técnicos pueden marcar tickets como resueltos', null, 403);
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return sendError(res, 'Ticket no encontrado', null, 404);
        }

        if (role === 'technician' && ticket.tecnico_asignado_id !== userId) {
            return sendError(res, 'Solo puedes marcar como resueltos los tickets asignados a ti', null, 403);
        }

        if (!ticket.tecnico_asignado_id) {
            return sendError(res, 'El ticket debe estar asignado a un técnico', null, 400);
        }

        if (ticket.estado_id === 1) {
            return sendError(res, 'No se puede marcar como resuelto un ticket "Abierto". Debe estar "Asignado" y "En Proceso" primero', null, 400);
        }

        if (ticket.estado_id === 2) {
            return sendError(res, 'No se puede marcar como resuelto un ticket "Asignado". Debe estar "En Proceso" primero', null, 400);
        }

        if (ticket.estado_id === 4) {
            return sendError(res, 'El ticket ya está marcado como "Resuelto"', null, 400);
        }

        if (ticket.estado_id === 5) {
            return sendError(res, 'No se puede marcar como resuelto un ticket "Cerrado"', null, 400);
        }

        if (ticket.estado_id !== 3) {
            return sendError(res, 'Solo se puede marcar como resuelto un ticket que está "En Proceso"', null, 400);
        }

        const estadoAnterior = await query('SELECT nombre FROM estados_ticket WHERE id = ?', [ticket.estado_id]);
        const estadoNuevo = await query('SELECT nombre FROM estados_ticket WHERE id = ?', [4]);

        const updatedTicket = await Ticket.update(id, { estado_id: 4 });

        await TicketHistorial.create({
            ticket_id: id,
            usuario_id: userId,
            tipo_cambio: 'ACTUALIZACION',
            campo_anterior: estadoAnterior[0]?.nombre || '',
            campo_nuevo: estadoNuevo[0]?.nombre || '',
            descripcion: `Estado cambiado de "${estadoAnterior[0]?.nombre || ''}" a "${estadoNuevo[0]?.nombre || ''}"`
        });

        sendSuccess(res, 'Ticket marcado como "Resuelto"', updatedTicket);
    } catch (error) {
        console.error('Error al marcar como resuelto:', error);
        sendError(res, 'Error al marcar ticket como resuelto', null, 500);
    }
};