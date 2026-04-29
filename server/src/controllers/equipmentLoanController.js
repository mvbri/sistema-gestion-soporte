import EquipmentLoan from '../models/EquipmentLoan.js';
import { sendError, sendSuccess } from '../utils/responseHandler.js';

const IT_ROLES = ['administrator', 'technician'];

const ensureItRole = (role) => IT_ROLES.includes(role);

const parsePagination = (query) => {
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.max(Number(query.limit || 10), 1);
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};

export const createEquipmentLoan = async (req, res) => {
    try {
        const { id: requesterUserId } = req.user;
        const { request_notes, target_incident_area_id, start_date, expected_return_date, items } = req.body;

        const loan = await EquipmentLoan.create({
            requester_user_id: requesterUserId,
            request_notes,
            target_incident_area_id: Number(target_incident_area_id),
            start_date,
            expected_return_date,
            items
        });

        sendSuccess(res, 'Solicitud de préstamo creada', loan, 201);
    } catch (error) {
        console.error('Error al crear préstamo:', error);
        sendError(res, error.message || 'Error al crear préstamo', null, 400);
    }
};

export const getEquipmentLoans = async (req, res) => {
    try {
        await EquipmentLoan.markOverdue();

        const { role, id: userId } = req.user;
        const { status, date_from, date_to, requester_user_id, search } = req.query;
        const { page, limit, offset } = parsePagination(req.query);

        const filters = { status, date_from, date_to, search, limit, offset };
        if (role === 'administrator') {
            if (requester_user_id) filters.requester_user_id = Number(requester_user_id);
        } else {
            filters.requester_user_id = userId;
        }

        const loans = await EquipmentLoan.findAll(filters);
        const total = await EquipmentLoan.count(filters);

        sendSuccess(res, 'Préstamos obtenidos correctamente', {
            loans,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error al listar préstamos:', error);
        sendError(res, 'Error al listar préstamos', null, 500);
    }
};

export const getEquipmentLoanById = async (req, res) => {
    try {
        const loanId = Number(req.params.id);
        const { role, id: userId } = req.user;
        const loan = await EquipmentLoan.findById(loanId);

        if (!loan) {
            return sendError(res, 'Préstamo no encontrado', null, 404);
        }
        if (role !== 'administrator' && loan.requester_user_id !== userId) {
            return sendError(res, 'No tienes permiso para ver este préstamo', null, 403);
        }

        sendSuccess(res, 'Préstamo obtenido correctamente', loan);
    } catch (error) {
        console.error('Error al obtener préstamo:', error);
        sendError(res, 'Error al obtener préstamo', null, 500);
    }
};

export const approveEquipmentLoan = async (req, res) => {
    try {
        if (req.user.role !== 'administrator') {
            return sendError(res, 'Solo administrador puede aprobar préstamos', null, 403);
        }
        const loan = await EquipmentLoan.approve(Number(req.params.id), req.user.id, req.body.notes);
        sendSuccess(res, 'Préstamo aprobado', loan);
    } catch (error) {
        console.error('Error al aprobar préstamo:', error);
        sendError(res, error.message || 'Error al aprobar préstamo', null, 400);
    }
};

export const rejectEquipmentLoan = async (req, res) => {
    try {
        if (req.user.role !== 'administrator') {
            return sendError(res, 'Solo administrador puede rechazar préstamos', null, 403);
        }
        const loan = await EquipmentLoan.reject(Number(req.params.id), req.user.id, req.body.reason);
        sendSuccess(res, 'Préstamo rechazado', loan);
    } catch (error) {
        console.error('Error al rechazar préstamo:', error);
        sendError(res, error.message || 'Error al rechazar préstamo', null, 400);
    }
};

export const deliverEquipmentLoan = async (req, res) => {
    try {
        if (req.user.role !== 'administrator') {
            return sendError(res, 'Solo administrador puede registrar entregas', null, 403);
        }
        const loan = await EquipmentLoan.deliver(Number(req.params.id), req.user.id, req.body);
        sendSuccess(res, 'Entrega registrada correctamente', loan);
    } catch (error) {
        console.error('Error al registrar entrega:', error);
        sendError(res, error.message || 'Error al registrar entrega', null, 400);
    }
};

export const returnEquipmentLoan = async (req, res) => {
    try {
        if (!ensureItRole(req.user.role)) {
            return sendError(res, 'Solo IT puede registrar devoluciones', null, 403);
        }
        const loan = await EquipmentLoan.returnLoan(Number(req.params.id), req.user.id, req.body);
        sendSuccess(res, 'Devolución registrada correctamente', loan);
    } catch (error) {
        console.error('Error al registrar devolución:', error);
        sendError(res, error.message || 'Error al registrar devolución', null, 400);
    }
};

export const updatePendingEquipmentLoanChecklist = async (req, res) => {
    try {
        const loanId = Number(req.params.id);
        const loan = await EquipmentLoan.updatePendingChecklist(loanId, req.user.id, req.body);
        sendSuccess(res, 'Checklist de solicitud actualizado correctamente', loan);
    } catch (error) {
        console.error('Error al actualizar checklist pendiente:', error);
        sendError(res, error.message || 'Error al actualizar checklist pendiente', null, 400);
    }
};

export const cancelEquipmentLoan = async (req, res) => {
    try {
        const loanId = Number(req.params.id);
        const loan = await EquipmentLoan.findById(loanId);

        if (!loan) {
            return sendError(res, 'Préstamo no encontrado', null, 404);
        }
        if (!ensureItRole(req.user.role) && loan.requester_user_id !== req.user.id) {
            return sendError(res, 'No tienes permiso para cancelar este préstamo', null, 403);
        }

        const cancelled = await EquipmentLoan.cancel(loanId, req.user.id, req.body.notes);
        sendSuccess(res, 'Préstamo cancelado', cancelled);
    } catch (error) {
        console.error('Error al cancelar préstamo:', error);
        sendError(res, error.message || 'Error al cancelar préstamo', null, 400);
    }
};

export const getEquipmentLoansSummaryReport = async (req, res) => {
    try {
        if (!ensureItRole(req.user.role)) {
            return sendError(res, 'Solo IT puede ver el reporte', null, 403);
        }

        const today = new Date();
        const dateTo = req.query.date_to || today.toISOString().slice(0, 10);
        const fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 29);
        const dateFrom = req.query.date_from || fromDate.toISOString().slice(0, 10);

        const report = await EquipmentLoan.getReportSummary(dateFrom, dateTo);
        sendSuccess(res, 'Reporte de préstamos generado correctamente', {
            period: { date_from: dateFrom, date_to: dateTo },
            ...report
        });
    } catch (error) {
        console.error('Error al generar reporte de préstamos:', error);
        sendError(res, 'Error al generar reporte de préstamos', null, 500);
    }
};

export const getAvailableEquipmentPools = async (_req, res) => {
    try {
        const pools = await EquipmentLoan.getAvailablePools();
        sendSuccess(res, 'Pools disponibles obtenidos correctamente', pools);
    } catch (error) {
        console.error('Error al obtener pools disponibles:', error);
        sendError(res, 'Error al obtener pools disponibles', null, 500);
    }
};
