import { query } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getCategorias = async (req, res) => {
    try {
        const sql = 'SELECT * FROM categorias_ticket ORDER BY nombre';
        const categorias = await query(sql);
        sendSuccess(res, 'Categorías obtenidas exitosamente', categorias);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        sendError(res, 'Error al obtener categorías', null, 500);
    }
};

export const createCategoria = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        const sql = 'INSERT INTO categorias_ticket (nombre, descripcion) VALUES (?, ?)';
        const result = await query(sql, [nombre, descripcion || null]);

        const nuevaCategoria = await query('SELECT * FROM categorias_ticket WHERE id = ?', [result.insertId]);
        sendSuccess(res, 'Categoría creada exitosamente', nuevaCategoria[0], 201);
    } catch (error) {
        console.error('Error al crear categoría:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'Ya existe una categoría con ese nombre', null, 400);
        }
        sendError(res, 'Error al crear categoría', null, 500);
    }
};

export const updateCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, activo } = req.body;

        const updates = [];
        const params = [];

        if (nombre !== undefined) {
            updates.push('nombre = ?');
            params.push(nombre);
        }
        if (descripcion !== undefined) {
            updates.push('descripcion = ?');
            params.push(descripcion);
        }
        if (activo !== undefined) {
            updates.push('activo = ?');
            params.push(activo);
        }

        if (updates.length === 0) {
            return sendError(res, 'No hay campos para actualizar', null, 400);
        }

        params.push(id);
        const sql = `UPDATE categorias_ticket SET ${updates.join(', ')} WHERE id = ?`;
        await query(sql, params);

        const categoria = await query('SELECT * FROM categorias_ticket WHERE id = ?', [id]);
        sendSuccess(res, 'Categoría actualizada exitosamente', categoria[0]);
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'Ya existe una categoría con ese nombre', null, 400);
        }
        sendError(res, 'Error al actualizar categoría', null, 500);
    }
};

export const getPrioridades = async (req, res) => {
    try {
        const sql = 'SELECT * FROM prioridades_ticket ORDER BY nivel';
        const prioridades = await query(sql);
        sendSuccess(res, 'Prioridades obtenidas exitosamente', prioridades);
    } catch (error) {
        console.error('Error al obtener prioridades:', error);
        sendError(res, 'Error al obtener prioridades', null, 500);
    }
};

export const createPrioridad = async (req, res) => {
    try {
        const { nombre, nivel, color, descripcion } = req.body;

        const sql = 'INSERT INTO prioridades_ticket (nombre, nivel, color, descripcion) VALUES (?, ?, ?, ?)';
        const result = await query(sql, [nombre, nivel, color, descripcion || null]);

        const nuevaPrioridad = await query('SELECT * FROM prioridades_ticket WHERE id = ?', [result.insertId]);
        sendSuccess(res, 'Prioridad creada exitosamente', nuevaPrioridad[0], 201);
    } catch (error) {
        console.error('Error al crear prioridad:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'Ya existe una prioridad con ese nombre o nivel', null, 400);
        }
        sendError(res, 'Error al crear prioridad', null, 500);
    }
};

export const updatePrioridad = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, nivel, color, descripcion, activo } = req.body;

        const updates = [];
        const params = [];

        if (nombre !== undefined) {
            updates.push('nombre = ?');
            params.push(nombre);
        }
        if (nivel !== undefined) {
            updates.push('nivel = ?');
            params.push(nivel);
        }
        if (color !== undefined) {
            updates.push('color = ?');
            params.push(color);
        }
        if (descripcion !== undefined) {
            updates.push('descripcion = ?');
            params.push(descripcion);
        }
        if (activo !== undefined) {
            updates.push('activo = ?');
            params.push(activo);
        }

        if (updates.length === 0) {
            return sendError(res, 'No hay campos para actualizar', null, 400);
        }

        params.push(id);
        const sql = `UPDATE prioridades_ticket SET ${updates.join(', ')} WHERE id = ?`;
        await query(sql, params);

        const prioridad = await query('SELECT * FROM prioridades_ticket WHERE id = ?', [id]);
        sendSuccess(res, 'Prioridad actualizada exitosamente', prioridad[0]);
    } catch (error) {
        console.error('Error al actualizar prioridad:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'Ya existe una prioridad con ese nombre o nivel', null, 400);
        }
        sendError(res, 'Error al actualizar prioridad', null, 500);
    }
};
