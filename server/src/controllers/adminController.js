import { query } from '../config/database.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import Usuario from '../models/Usuario.js';

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

/**
 * Obtiene todos los usuarios con filtros opcionales.
 */
export const getUsers = async (req, res) => {
    try {
        const { active, role_id, search, page, limit, orderBy, orderDirection } = req.query;

        const filters = {};
        if (active !== undefined) {
            filters.active = active === 'true';
        }
        if (role_id !== undefined) {
            filters.role_id = Number(role_id);
        }
        if (search) {
            filters.search = search;
        }
        if (page) {
            filters.page = Number(page);
        }
        if (limit) {
            filters.limit = Number(limit);
        }
        if (orderBy) {
            filters.orderBy = orderBy;
        }
        if (orderDirection) {
            filters.orderDirection = orderDirection;
        }

        console.log('🔍 Filtros aplicados para getUsers:', filters);
        const result = await Usuario.findAll(filters);
        console.log('✅ Usuarios encontrados:', result.users.length, 'Total:', result.pagination.total);
        
        // Mapear role_name a role para consistencia con el frontend
        const users = result.users.map(user => {
            const userObj = { ...user };
            // Asegurar que role esté presente
            if (!userObj.role && userObj.role_name) {
                userObj.role = userObj.role_name;
            }
            // Convertir active de 0/1 a boolean si es necesario
            if (typeof userObj.active === 'number') {
                userObj.active = userObj.active === 1;
            }
            // Convertir email_verified de 0/1 a boolean si es necesario
            if (typeof userObj.email_verified === 'number') {
                userObj.email_verified = userObj.email_verified === 1;
            }
            return userObj;
        });
        
        sendSuccess(res, 'Usuarios obtenidos exitosamente', {
            users,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        console.error('Stack trace:', error.stack);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        sendError(res, `Error al obtener usuarios: ${error.message}`, null, 500);
    }
};

/**
 * Crea un nuevo usuario (solo administrador).
 */
export const createUser = async (req, res) => {
    try {
        const { full_name, email, password, phone, incident_area_id, role_id, active } = req.body;

        if (!full_name || !email || !password) {
            return sendError(res, 'Nombre completo, email y contraseña son requeridos', null, 400);
        }

        const emailExists = await Usuario.emailExists(email);
        if (emailExists) {
            return sendError(res, 'El email ya está registrado', null, 400);
        }

        const user = await Usuario.create({
            full_name,
            email,
            password,
            phone: phone || null,
            incident_area_id: incident_area_id ? Number(incident_area_id) : null,
            role_id: role_id ? Number(role_id) : 3,
            active: active === true || active === 'true'
        });

        const responseData = {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            active: user.active,
            email_verified: user.email_verified
        };

        sendSuccess(res, 'Usuario creado exitosamente', responseData, 201);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        sendError(res, 'Error al crear usuario', null, 500);
    }
};

/**
 * Actualiza el estado activo/inactivo de un usuario.
 */
export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;

        if (active === undefined || typeof active !== 'boolean') {
            return sendError(res, 'El campo active es requerido y debe ser un booleano', null, 400);
        }

        const user = await Usuario.findById(id);
        if (!user) {
            return sendError(res, 'Usuario no encontrado', null, 404);
        }

        const updatedUser = await Usuario.updateActiveStatus(id, active);
        
        sendSuccess(res, `Usuario ${active ? 'activado' : 'desactivado'} exitosamente`, {
            id: updatedUser.id,
            full_name: updatedUser.full_name,
            email: updatedUser.email,
            active: updatedUser.active
        });
    } catch (error) {
        console.error('Error al actualizar estado del usuario:', error);
        sendError(res, 'Error al actualizar estado del usuario', null, 500);
    }
};

/**
 * Actualiza un usuario existente.
 */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, email, phone, incident_area_id, role_id, active, password } = req.body;

        const user = await Usuario.findById(id);
        if (!user) {
            return sendError(res, 'Usuario no encontrado', null, 404);
        }

        // Verificar si el email ya existe en otro usuario
        if (email && email !== user.email) {
            const emailExists = await Usuario.emailExists(email);
            if (emailExists) {
                return sendError(res, 'El email ya está registrado en otro usuario', null, 400);
            }
        }

        const updateData = {};
        if (full_name !== undefined) updateData.full_name = full_name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (incident_area_id !== undefined) updateData.incident_area_id = incident_area_id;
        if (role_id !== undefined) updateData.role_id = role_id;
        if (active !== undefined) updateData.active = active;
        if (password !== undefined && password !== '') updateData.password = password;

        const updatedUser = await Usuario.update(id, updateData);
        
        // Mapear role_name a role
        const userResponse = {
            ...updatedUser,
            role: updatedUser.role_name || updatedUser.role
        };
        
        sendSuccess(res, 'Usuario actualizado exitosamente', userResponse);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        if (error.message === 'No hay campos para actualizar') {
            return sendError(res, error.message, null, 400);
        }
        sendError(res, 'Error al actualizar usuario', null, 500);
    }
};

/**
 * Verifica el email de un usuario manualmente (solo administrador).
 */
export const verifyUserEmail = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await Usuario.findById(id);
        if (!user) {
            return sendError(res, 'Usuario no encontrado', null, 404);
        }

        if (user.email_verified) {
            return sendError(res, 'El email del usuario ya está verificado', null, 400);
        }

        await Usuario.verifyEmail(id);
        const updatedUser = await Usuario.findById(id);
        
        sendSuccess(res, 'Email verificado exitosamente', {
            id: updatedUser.id,
            full_name: updatedUser.full_name,
            email: updatedUser.email,
            email_verified: updatedUser.email_verified
        });
    } catch (error) {
        console.error('Error al verificar email del usuario:', error);
        sendError(res, 'Error al verificar email del usuario', null, 500);
    }
};

/**
 * Elimina un usuario.
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await Usuario.findById(id);
        if (!user) {
            return sendError(res, 'Usuario no encontrado', null, 404);
        }

        // Verificar si el usuario tiene tickets creados
        const ticketsCreated = await query(
            'SELECT COUNT(*) as count FROM tickets WHERE created_by_user_id = ?',
            [id]
        );
        if (ticketsCreated[0]?.count > 0) {
            return sendError(
                res,
                'No se puede eliminar el usuario porque tiene tickets asociados',
                null,
                400
            );
        }

        // Verificar si el usuario tiene tickets asignados
        const ticketsAssigned = await query(
            'SELECT COUNT(*) as count FROM tickets WHERE assigned_technician_id = ?',
            [id]
        );
        if (ticketsAssigned[0]?.count > 0) {
            return sendError(
                res,
                'No se puede eliminar el usuario porque tiene tickets asignados',
                null,
                400
            );
        }

        await Usuario.delete(id);
        sendSuccess(res, 'Usuario eliminado exitosamente', null);
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
            return sendError(
                res,
                'No se puede eliminar el usuario porque tiene registros asociados',
                null,
                400
            );
        }
        sendError(res, 'Error al eliminar usuario', null, 500);
    }
};