import { query } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

/**
 * Obtiene todas las categorías de ticket.
 */
export const getCategorias = async (req, res) => {
    try {
        let sql = 'SELECT * FROM ticket_categories ORDER BY name';
        try {
            const categorias = await query(sql);
            sendSuccess(res, 'Categorías obtenidas exitosamente', categorias);
        } catch (error) {
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                sql = 'SELECT * FROM ticket_categories ORDER BY nombre';
                const categorias = await query(sql);
                sendSuccess(res, 'Categorías obtenidas exitosamente', categorias);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        sendError(res, 'Error al obtener categorías', null, 500);
    }
};

/**
 * Crea una nueva categoría de ticket.
 */
export const createCategoria = async (req, res) => {
    try {
        const { name, description } = req.body;

        const sql = 'INSERT INTO ticket_categories (name, description) VALUES (?, ?)';
        const result = await query(sql, [name, description || null]);

        const nuevaCategoria = await query('SELECT * FROM ticket_categories WHERE id = ?', [result.insertId]);
        sendSuccess(res, 'Categoría creada exitosamente', nuevaCategoria[0], 201);
    } catch (error) {
        console.error('Error al crear categoría:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'Ya existe una categoría con ese nombre', null, 400);
        }
        sendError(res, 'Error al crear categoría', null, 500);
    }
};

/**
 * Actualiza una categoría de ticket existente.
 */
export const updateCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, active } = req.body;

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (active !== undefined) {
            updates.push('active = ?');
            params.push(active);
        }

        if (updates.length === 0) {
            return sendError(res, 'No hay campos para actualizar', null, 400);
        }

        params.push(id);
        const sql = `UPDATE ticket_categories SET ${updates.join(', ')} WHERE id = ?`;
        await query(sql, params);

        const categoria = await query('SELECT * FROM ticket_categories WHERE id = ?', [id]);
        sendSuccess(res, 'Categoría actualizada exitosamente', categoria[0]);
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'Ya existe una categoría con ese nombre', null, 400);
        }
        sendError(res, 'Error al actualizar categoría', null, 500);
    }
};

/**
 * Elimina una categoría de ticket por id.
 */
export const deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;

        const categoria = await query('SELECT * FROM ticket_categories WHERE id = ?', [id]);
        if (categoria.length === 0) {
            return sendError(res, 'La categoría no existe', null, 404);
        }

        try {
            await query('DELETE FROM ticket_categories WHERE id = ?', [id]);
        } catch (error) {
            // Posible restricción por claves foráneas (tickets asociados)
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
                return sendError(
                    res,
                    'No se puede eliminar la categoría porque tiene tickets asociados',
                    null,
                    400
                );
            }
            throw error;
        }

        sendSuccess(res, 'Categoría eliminada exitosamente', null);
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        sendError(res, 'Error al eliminar categoría', null, 500);
    }
};

export const getPrioridades = async (req, res) => {
    try {
        let sql = 'SELECT * FROM ticket_priorities ORDER BY level';
        try {
            const prioridades = await query(sql);
            sendSuccess(res, 'Prioridades obtenidas exitosamente', prioridades);
        } catch (error) {
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                sql = 'SELECT * FROM ticket_priorities ORDER BY nivel';
                const prioridades = await query(sql);
                sendSuccess(res, 'Prioridades obtenidas exitosamente', prioridades);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error al obtener prioridades:', error);
        sendError(res, 'Error al obtener prioridades', null, 500);
    }
};

export const createPrioridad = async (req, res) => {
    try {
        const { name, level, color, description } = req.body;

        const sql = 'INSERT INTO ticket_priorities (name, level, color, description) VALUES (?, ?, ?, ?)';
        const result = await query(sql, [name, level, color, description || null]);

        const nuevaPrioridad = await query('SELECT * FROM ticket_priorities WHERE id = ?', [result.insertId]);
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
        const { name, level, color, description, active } = req.body;

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (level !== undefined) {
            updates.push('level = ?');
            params.push(level);
        }
        if (color !== undefined) {
            updates.push('color = ?');
            params.push(color);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (active !== undefined) {
            updates.push('active = ?');
            params.push(active);
        }

        if (updates.length === 0) {
            return sendError(res, 'No hay campos para actualizar', null, 400);
        }

        params.push(id);
        const sql = `UPDATE ticket_priorities SET ${updates.join(', ')} WHERE id = ?`;
        await query(sql, params);

        const prioridad = await query('SELECT * FROM ticket_priorities WHERE id = ?', [id]);
        sendSuccess(res, 'Prioridad actualizada exitosamente', prioridad[0]);
    } catch (error) {
        console.error('Error al actualizar prioridad:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'Ya existe una prioridad con ese nombre o nivel', null, 400);
        }
        sendError(res, 'Error al actualizar prioridad', null, 500);
    }
};

/**
 * Elimina una prioridad de ticket por id.
 */
export const deletePrioridad = async (req, res) => {
    try {
        const { id } = req.params;

        const prioridad = await query('SELECT * FROM ticket_priorities WHERE id = ?', [id]);
        if (prioridad.length === 0) {
            return sendError(res, 'La prioridad no existe', null, 404);
        }

        try {
            await query('DELETE FROM ticket_priorities WHERE id = ?', [id]);
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
                return sendError(
                    res,
                    'No se puede eliminar la prioridad porque tiene tickets asociados',
                    null,
                    400
                );
            }
            throw error;
        }

        sendSuccess(res, 'Prioridad eliminada exitosamente', null);
    } catch (error) {
        console.error('Error al eliminar prioridad:', error);
        sendError(res, 'Error al eliminar prioridad', null, 500);
    }
};

/**
 * Obtiene todas las direcciones/áreas de incidentes con paginación, búsqueda y ordenamiento.
 */
export const getDirecciones = async (req, res) => {
    try {
        const {
            search,
            page,
            limit,
            orderBy,
            orderDirection
        } = req.query;

        const pageNum = page ? parseInt(page) : 1;
        const limitNum = limit ? parseInt(limit) : 10;
        const orderByValue = orderBy || 'name';
        const orderDirectionValue = orderDirection || 'ASC';

        const validOrderColumns = ['name', 'description', 'active', 'created_at', 'updated_at'];
        const validOrderDirections = ['ASC', 'DESC'];
        
        const orderColumn = validOrderColumns.includes(orderByValue) ? orderByValue : 'name';
        const orderDir = validOrderDirections.includes(orderDirectionValue.toUpperCase()) 
            ? orderDirectionValue.toUpperCase() 
            : 'ASC';

        let whereClause = '';
        const params = [];

        if (search) {
            whereClause = 'WHERE (name LIKE ? OR description LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm);
        }

        const offset = (pageNum - 1) * limitNum;
        const limitValue = limitNum;

        let countSql = `SELECT COUNT(*) as total FROM incident_areas ${whereClause}`;
        let sql = `SELECT * FROM incident_areas ${whereClause} ORDER BY ${orderColumn} ${orderDir} LIMIT ? OFFSET ?`;

        try {
            const countResult = await query(countSql, params);
            const total = countResult[0].total;

            const direcciones = await query(sql, [...params, limitValue, offset]);

            sendSuccess(res, 'Direcciones obtenidas exitosamente', {
                direcciones,
                pagination: {
                    page: pageNum,
                    limit: limitValue,
                    total: Number(total),
                    totalPages: Math.ceil(Number(total) / limitValue)
                }
            });
        } catch (error) {
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                const fallbackOrderColumn = orderColumn === 'name' ? 'nombre' : orderColumn;
                const fallbackCountSql = `SELECT COUNT(*) as total FROM incident_areas ${whereClause}`;
                const fallbackSql = `SELECT * FROM incident_areas ${whereClause} ORDER BY ${fallbackOrderColumn} ${orderDir} LIMIT ? OFFSET ?`;
                
                const countResult = await query(fallbackCountSql, params);
                const total = countResult[0].total;
                
                const direcciones = await query(fallbackSql, [...params, limitValue, offset]);
                
                sendSuccess(res, 'Direcciones obtenidas exitosamente', {
                    direcciones,
                    pagination: {
                        page: pageNum,
                        limit: limitValue,
                        total: Number(total),
                        totalPages: Math.ceil(Number(total) / limitValue)
                    }
                });
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error al obtener direcciones:', error);
        sendError(res, 'Error al obtener direcciones', null, 500);
    }
};

/**
 * Crea una nueva dirección/área de incidente.
 */
export const createDireccion = async (req, res) => {
    try {
        const { name, description } = req.body;

        const sql = 'INSERT INTO incident_areas (name, description) VALUES (?, ?)';
        const result = await query(sql, [name, description || null]);

        const nuevaDireccion = await query('SELECT * FROM incident_areas WHERE id = ?', [result.insertId]);
        sendSuccess(res, 'Dirección creada exitosamente', nuevaDireccion[0], 201);
    } catch (error) {
        console.error('Error al crear dirección:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'Ya existe una dirección con ese nombre', null, 400);
        }
        sendError(res, 'Error al crear dirección', null, 500);
    }
};

/**
 * Actualiza una dirección/área de incidente existente.
 */
export const updateDireccion = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, active } = req.body;

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (active !== undefined) {
            updates.push('active = ?');
            params.push(active);
        }

        if (updates.length === 0) {
            return sendError(res, 'No hay campos para actualizar', null, 400);
        }

        params.push(id);
        const sql = `UPDATE incident_areas SET ${updates.join(', ')} WHERE id = ?`;
        await query(sql, params);

        const direccion = await query('SELECT * FROM incident_areas WHERE id = ?', [id]);
        sendSuccess(res, 'Dirección actualizada exitosamente', direccion[0]);
    } catch (error) {
        console.error('Error al actualizar dirección:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'Ya existe una dirección con ese nombre', null, 400);
        }
        sendError(res, 'Error al actualizar dirección', null, 500);
    }
};

/**
 * Elimina una dirección/área de incidente por id.
 */
/**
 * Obtiene todos los tipos de equipos.
 */
export const getEquipmentTypes = async (req, res) => {
    try {
        let sql = 'SELECT * FROM equipment_types ORDER BY name';
        try {
            const tipos = await query(sql);
            sendSuccess(res, 'Tipos de equipos obtenidos exitosamente', tipos);
        } catch (error) {
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                sql = 'SELECT * FROM equipment_types ORDER BY nombre';
                const tipos = await query(sql);
                sendSuccess(res, 'Tipos de equipos obtenidos exitosamente', tipos);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error al obtener tipos de equipos:', error);
        sendError(res, 'Error al obtener tipos de equipos', null, 500);
    }
};

/**
 * Crea un nuevo tipo de equipo.
 */
export const createEquipmentType = async (req, res) => {
    try {
        const { name, description } = req.body;

        const sql = 'INSERT INTO equipment_types (name, description) VALUES (?, ?)';
        const result = await query(sql, [name, description || null]);

        const nuevoTipo = await query('SELECT * FROM equipment_types WHERE id = ?', [result.insertId]);
        sendSuccess(res, 'Tipo de equipo creado exitosamente', nuevoTipo[0], 201);
    } catch (error) {
        console.error('Error al crear tipo de equipo:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'Ya existe un tipo de equipo con ese nombre', null, 400);
        }
        sendError(res, 'Error al crear tipo de equipo', null, 500);
    }
};

/**
 * Actualiza un tipo de equipo existente.
 */
export const updateEquipmentType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, active } = req.body;

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (active !== undefined) {
            updates.push('active = ?');
            params.push(active);
        }

        if (updates.length === 0) {
            return sendError(res, 'No hay campos para actualizar', null, 400);
        }

        params.push(id);
        const sql = `UPDATE equipment_types SET ${updates.join(', ')} WHERE id = ?`;
        await query(sql, params);

        const tipo = await query('SELECT * FROM equipment_types WHERE id = ?', [id]);
        sendSuccess(res, 'Tipo de equipo actualizado exitosamente', tipo[0]);
    } catch (error) {
        console.error('Error al actualizar tipo de equipo:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'Ya existe un tipo de equipo con ese nombre', null, 400);
        }
        sendError(res, 'Error al actualizar tipo de equipo', null, 500);
    }
};

/**
 * Elimina un tipo de equipo por id.
 */
export const deleteEquipmentType = async (req, res) => {
    try {
        const { id } = req.params;

        const tipo = await query('SELECT * FROM equipment_types WHERE id = ?', [id]);
        if (tipo.length === 0) {
            return sendError(res, 'El tipo de equipo no existe', null, 404);
        }

        try {
            await query('DELETE FROM equipment_types WHERE id = ?', [id]);
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
                return sendError(
                    res,
                    'No se puede eliminar el tipo de equipo porque tiene equipos asociados',
                    null,
                    400
                );
            }
            throw error;
        }

        sendSuccess(res, 'Tipo de equipo eliminado exitosamente', null);
    } catch (error) {
        console.error('Error al eliminar tipo de equipo:', error);
        sendError(res, 'Error al eliminar tipo de equipo', null, 500);
    }
};

/**
 * Obtiene todos los tipos de consumibles.
 */
export const getConsumableTypesAdmin = async (req, res) => {
    try {
        let sql = 'SELECT * FROM consumable_types ORDER BY name';
        try {
            const tipos = await query(sql);
            sendSuccess(res, 'Tipos de consumibles obtenidos exitosamente', tipos);
        } catch (error) {
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                sql = 'SELECT * FROM consumable_types ORDER BY nombre';
                const tipos = await query(sql);
                sendSuccess(res, 'Tipos de consumibles obtenidos exitosamente', tipos);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error al obtener tipos de consumibles:', error);
        sendError(res, 'Error al obtener tipos de consumibles', null, 500);
    }
};

/**
 * Crea un nuevo tipo de consumible.
 */
export const createConsumableType = async (req, res) => {
    try {
        const { name, description } = req.body;

        const sql = 'INSERT INTO consumable_types (name, description) VALUES (?, ?)';
        const result = await query(sql, [name, description || null]);

        const nuevoTipo = await query('SELECT * FROM consumable_types WHERE id = ?', [result.insertId]);
        sendSuccess(res, 'Tipo de consumible creado exitosamente', nuevoTipo[0], 201);
    } catch (error) {
        console.error('Error al crear tipo de consumible:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'Ya existe un tipo de consumible con ese nombre', null, 400);
        }
        sendError(res, 'Error al crear tipo de consumible', null, 500);
    }
};

/**
 * Actualiza un tipo de consumible existente.
 */
export const updateConsumableType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, active } = req.body;

        const updates = [];
        const params = [];

        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (active !== undefined) {
            updates.push('active = ?');
            params.push(active);
        }

        if (updates.length === 0) {
            return sendError(res, 'No hay campos para actualizar', null, 400);
        }

        params.push(id);
        const sql = `UPDATE consumable_types SET ${updates.join(', ')} WHERE id = ?`;
        await query(sql, params);

        const tipo = await query('SELECT * FROM consumable_types WHERE id = ?', [id]);
        sendSuccess(res, 'Tipo de consumible actualizado exitosamente', tipo[0]);
    } catch (error) {
        console.error('Error al actualizar tipo de consumible:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return sendError(res, 'Ya existe un tipo de consumible con ese nombre', null, 400);
        }
        sendError(res, 'Error al actualizar tipo de consumible', null, 500);
    }
};

/**
 * Elimina un tipo de consumible por id.
 */
export const deleteConsumableType = async (req, res) => {
    try {
        const { id } = req.params;

        const tipo = await query('SELECT * FROM consumable_types WHERE id = ?', [id]);
        if (tipo.length === 0) {
            return sendError(res, 'El tipo de consumible no existe', null, 404);
        }

        try {
            await query('DELETE FROM consumable_types WHERE id = ?', [id]);
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
                return sendError(
                    res,
                    'No se puede eliminar el tipo de consumible porque tiene consumibles asociados',
                    null,
                    400
                );
            }
            throw error;
        }

        sendSuccess(res, 'Tipo de consumible eliminado exitosamente', null);
    } catch (error) {
        console.error('Error al eliminar tipo de consumible:', error);
        sendError(res, 'Error al eliminar tipo de consumible', null, 500);
    }
};

export const deleteDireccion = async (req, res) => {
    try {
        const { id } = req.params;

        const direccion = await query('SELECT * FROM incident_areas WHERE id = ?', [id]);
        if (direccion.length === 0) {
            return sendError(res, 'La dirección no existe', null, 404);
        }

        try {
            await query('DELETE FROM incident_areas WHERE id = ?', [id]);
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
                return sendError(
                    res,
                    'No se puede eliminar la dirección porque tiene tickets asociados',
                    null,
                    400
                );
            }
            throw error;
        }

        sendSuccess(res, 'Dirección eliminada exitosamente', null);
    } catch (error) {
        console.error('Error al eliminar dirección:', error);
        sendError(res, 'Error al eliminar dirección', null, 500);
    }
};