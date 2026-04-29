import MaterialRequest from '../models/MaterialRequest.js';
import { sendError, sendSuccess } from '../utils/responseHandler.js';

const parsePagination = (query) => {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.max(Number(query.limit || 10), 1);
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};

const canAccessRequest = (request, user) => {
    if (!request) return false;
    if (user.role === 'administrator') return true;
    return request.requester_user_id === user.id;
};

export const createMaterialRequest = async (req, res) => {
    try {
        const created = await MaterialRequest.create({
            requester_user_id: req.user.id,
            request_notes: req.body.request_notes,
            addressee_name: req.body.addressee_name,
            addressee_title: req.body.addressee_title,
            addressee_addressing_text: req.body.addressee_addressing_text,
            items: req.body.items
        });
        sendSuccess(res, 'Solicitud de materiales creada', created, 201);
    } catch (error) {
        console.error('Error al crear solicitud de materiales:', error);
        sendError(res, error.message || 'Error al crear solicitud de materiales', null, 400);
    }
};

export const getMaterialRequests = async (req, res) => {
    try {
        const { status, date_from, date_to, search, requester_user_id } = req.query;
        const { page, limit, offset } = parsePagination(req.query);
        const filters = { status, date_from, date_to, search, limit, offset };
        // #region agent log
        fetch('http://127.0.0.1:7304/ingest/20b01933-ba4f-418f-881b-434a9d7e19c8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'630cc1'},body:JSON.stringify({sessionId:'630cc1',runId:'initial',hypothesisId:'H2',location:'materialRequestController.js:getMaterialRequests:entry',message:'Incoming request list query and user context',data:{query:req.query,userId:req.user?.id,userRole:req.user?.role},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        if (req.user.role === 'administrator') {
            if (requester_user_id) filters.requester_user_id = Number(requester_user_id);
        } else {
            filters.requester_user_id = req.user.id;
        }
        // #region agent log
        fetch('http://127.0.0.1:7304/ingest/20b01933-ba4f-418f-881b-434a9d7e19c8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'630cc1'},body:JSON.stringify({sessionId:'630cc1',runId:'initial',hypothesisId:'H3',location:'materialRequestController.js:getMaterialRequests:filters',message:'Effective filters after RBAC',data:{filters},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        const requests = await MaterialRequest.findAll(filters);
        const total = await MaterialRequest.count(filters);
        // #region agent log
        fetch('http://127.0.0.1:7304/ingest/20b01933-ba4f-418f-881b-434a9d7e19c8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'630cc1'},body:JSON.stringify({sessionId:'630cc1',runId:'initial',hypothesisId:'H5',location:'materialRequestController.js:getMaterialRequests:result',message:'DB list result summary',data:{rows:requests.length,total,firstStatus:requests[0]?.status||null,firstRequesterId:requests[0]?.requester_user_id||null},timestamp:Date.now()})}).catch(()=>{});
        // #endregion

        sendSuccess(res, 'Solicitudes obtenidas correctamente', {
            requests,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error al listar solicitudes de materiales:', error);
        sendError(res, 'Error al listar solicitudes de materiales', null, 500);
    }
};

export const getMaterialRequestById = async (req, res) => {
    try {
        const requestId = Number(req.params.id);
        const materialRequest = await MaterialRequest.findById(requestId);
        if (!materialRequest) {
            return sendError(res, 'Solicitud no encontrada', null, 404);
        }
        if (!canAccessRequest(materialRequest, req.user)) {
            return sendError(res, 'No tienes permiso para ver esta solicitud', null, 403);
        }

        sendSuccess(res, 'Solicitud obtenida correctamente', materialRequest);
    } catch (error) {
        console.error('Error al obtener solicitud de materiales:', error);
        sendError(res, 'Error al obtener solicitud de materiales', null, 500);
    }
};

export const approveMaterialRequest = async (req, res) => {
    try {
        if (req.user.role !== 'administrator') {
            return sendError(res, 'Solo administrador puede aprobar solicitudes', null, 403);
        }
        const approved = await MaterialRequest.approve(Number(req.params.id), req.user.id, req.body.notes);
        sendSuccess(res, 'Solicitud aprobada correctamente', approved);
    } catch (error) {
        console.error('Error al aprobar solicitud de materiales:', error);
        sendError(res, error.message || 'Error al aprobar solicitud de materiales', null, 400);
    }
};

export const rejectMaterialRequest = async (req, res) => {
    try {
        if (req.user.role !== 'administrator') {
            return sendError(res, 'Solo administrador puede rechazar solicitudes', null, 403);
        }
        const rejected = await MaterialRequest.reject(Number(req.params.id), req.user.id, req.body.reason);
        sendSuccess(res, 'Solicitud rechazada correctamente', rejected);
    } catch (error) {
        console.error('Error al rechazar solicitud de materiales:', error);
        sendError(res, error.message || 'Error al rechazar solicitud de materiales', null, 400);
    }
};

export const cancelMaterialRequest = async (req, res) => {
    try {
        const requestId = Number(req.params.id);
        const materialRequest = await MaterialRequest.findById(requestId);
        if (!materialRequest) {
            return sendError(res, 'Solicitud no encontrada', null, 404);
        }
        const isAdmin = req.user.role === 'administrator';
        const isRequester = materialRequest.requester_user_id === req.user.id;

        if (materialRequest.status === 'approved') {
            if (!isAdmin) {
                return sendError(
                    res,
                    'Solo el administrador puede cancelar solicitudes ya aprobadas',
                    null,
                    403
                );
            }
        } else if (materialRequest.status === 'pending') {
            if (!isRequester && !isAdmin) {
                return sendError(res, 'No tienes permiso para cancelar esta solicitud', null, 403);
            }
        } else {
            return sendError(res, 'Esta solicitud no se puede cancelar en su estado actual', null, 400);
        }

        const cancelled = await MaterialRequest.cancel(requestId, req.user.id, req.body.notes);
        sendSuccess(res, 'Solicitud cancelada correctamente', cancelled);
    } catch (error) {
        console.error('Error al cancelar solicitud de materiales:', error);
        sendError(res, error.message || 'Error al cancelar solicitud de materiales', null, 400);
    }
};

export const getMaterialRequestComments = async (req, res) => {
    try {
        const requestId = Number(req.params.id);
        const materialRequest = await MaterialRequest.findById(requestId);
        if (!materialRequest) {
            return sendError(res, 'Solicitud no encontrada', null, 404);
        }
        if (!canAccessRequest(materialRequest, req.user)) {
            return sendError(res, 'No tienes permiso para ver los comentarios', null, 403);
        }

        const comments = await MaterialRequest.getComments(requestId);
        sendSuccess(res, 'Comentarios obtenidos correctamente', comments);
    } catch (error) {
        console.error('Error al obtener comentarios de solicitud:', error);
        sendError(res, 'Error al obtener comentarios de solicitud', null, 500);
    }
};

export const addMaterialRequestComment = async (req, res) => {
    try {
        const requestId = Number(req.params.id);
        const materialRequest = await MaterialRequest.findById(requestId);
        if (!materialRequest) {
            return sendError(res, 'Solicitud no encontrada', null, 404);
        }
        if (!canAccessRequest(materialRequest, req.user)) {
            return sendError(res, 'No tienes permiso para comentar en esta solicitud', null, 403);
        }

        const createdComment = await MaterialRequest.addComment(
            requestId,
            req.user.id,
            req.body.comment_text.trim()
        );
        sendSuccess(res, 'Comentario agregado correctamente', createdComment, 201);
    } catch (error) {
        console.error('Error al agregar comentario de solicitud:', error);
        sendError(res, error.message || 'Error al agregar comentario de solicitud', null, 400);
    }
};

export const getMaterialRequestPdfData = async (req, res) => {
    try {
        if (req.user.role !== 'administrator') {
            return sendError(res, 'Solo administrador puede generar PDF', null, 403);
        }
        const requestId = Number(req.params.id);
        const materialRequest = await MaterialRequest.findById(requestId);
        if (!materialRequest) {
            return sendError(res, 'Solicitud no encontrada', null, 404);
        }
        if (materialRequest.status !== 'approved') {
            return sendError(res, 'Solo se puede generar PDF para solicitudes aprobadas', null, 400);
        }
        sendSuccess(res, 'Datos para PDF obtenidos correctamente', materialRequest);
    } catch (error) {
        console.error('Error al obtener datos PDF de solicitud:', error);
        sendError(res, 'Error al obtener datos PDF de solicitud', null, 500);
    }
};

