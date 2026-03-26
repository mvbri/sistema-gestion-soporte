import FrequentIssue from '../models/FrequentIssue.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

/**
 * Lista fallas frecuentes para uso en formularios y respuestas.
 */
export const getFrequentIssues = async (req, res) => {
    try {
        const issues = await FrequentIssue.findAll(true);
        sendSuccess(res, 'Fallas frecuentes obtenidas exitosamente', issues);
    } catch (error) {
        console.error('Error al obtener fallas frecuentes:', error);
        sendError(res, 'Error al obtener fallas frecuentes', null, 500);
    }
};

/**
 * Lista fallas frecuentes para administración.
 */
export const getFrequentIssuesAdmin = async (req, res) => {
    try {
        const issues = await FrequentIssue.findAll(false);
        sendSuccess(res, 'Fallas frecuentes obtenidas exitosamente', issues);
    } catch (error) {
        console.error('Error al obtener fallas frecuentes (admin):', error);
        sendError(res, 'Error al obtener fallas frecuentes', null, 500);
    }
};

/**
 * Crea una nueva falla frecuente.
 */
export const createFrequentIssue = async (req, res) => {
    try {
        const { title, symptoms, possible_solution, category_id, active } = req.body;
        const issue = await FrequentIssue.create({
            title,
            symptoms,
            possible_solution,
            category_id: category_id ? Number(category_id) : null,
            active: active === undefined ? true : Boolean(active)
        });
        sendSuccess(res, 'Falla frecuente creada exitosamente', issue, 201);
    } catch (error) {
        console.error('Error al crear falla frecuente:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'Ya existe una falla frecuente con ese título', null, 400);
        }
        sendError(res, 'Error al crear falla frecuente', null, 500);
    }
};

/**
 * Actualiza una falla frecuente.
 */
export const updateFrequentIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const existingIssue = await FrequentIssue.findById(id);
        if (!existingIssue) {
            return sendError(res, 'La falla frecuente no existe', null, 404);
        }

        const { title, symptoms, possible_solution, category_id, active } = req.body;
        const issue = await FrequentIssue.update(id, {
            title,
            symptoms,
            possible_solution,
            category_id: category_id === undefined ? undefined : (category_id ? Number(category_id) : null),
            active
        });
        sendSuccess(res, 'Falla frecuente actualizada exitosamente', issue);
    } catch (error) {
        console.error('Error al actualizar falla frecuente:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'Ya existe una falla frecuente con ese título', null, 400);
        }
        sendError(res, 'Error al actualizar falla frecuente', null, 500);
    }
};

/**
 * Elimina una falla frecuente.
 */
export const deleteFrequentIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const existingIssue = await FrequentIssue.findById(id);
        if (!existingIssue) {
            return sendError(res, 'La falla frecuente no existe', null, 404);
        }

        await FrequentIssue.delete(id);
        sendSuccess(res, 'Falla frecuente eliminada exitosamente', null);
    } catch (error) {
        console.error('Error al eliminar falla frecuente:', error);
        sendError(res, 'Error al eliminar falla frecuente', null, 500);
    }
};
