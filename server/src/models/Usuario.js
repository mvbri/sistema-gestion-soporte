// Modelo de Usuario
import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

class Usuario {
    static normalizeEmail(email) {
        if (!email || typeof email !== 'string') return email;
        return email.trim().toLowerCase();
    }

    static async create(data) {
        const { full_name, email, password, phone, incident_area_id, role_id = 3, active = false } = data;
        
        const normalizedEmail = this.normalizeEmail(email);
        const passwordHash = await bcrypt.hash(password, 10);

        // Obtener nombre de la dirección para mantener el campo department sincronizado
        let department = null;
        if (incident_area_id) {
            try {
                const direccion = await query(
                    'SELECT name FROM incident_areas WHERE id = ?',
                    [incident_area_id]
                );
                department = direccion[0]?.name || null;
            } catch (error) {
                console.error('Error al obtener nombre de dirección para el usuario:', error);
            }
        }

        const sql = `
            INSERT INTO users (full_name, email, password, phone, department, incident_area_id, role_id, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const result = await query(sql, [
            full_name,
            normalizedEmail,
            passwordHash,
            phone || null,
            department,
            incident_area_id || null,
            role_id,
            active === true ? 1 : 0
        ]);
        
        // Convertir BigInt a Number explícitamente
        const insertId = typeof result.insertId === 'bigint' 
            ? Number(result.insertId) 
            : Number(result.insertId);
        
        return {
            id: insertId,
            full_name,
            email: normalizedEmail,
            phone,
            department,
            incident_area_id: incident_area_id || null,
            role_id: Number(role_id),
            active: active === true,
            email_verified: false
        };
    }

    static async findByEmail(email) {
        try {
            const normalizedEmail = this.normalizeEmail(email);
            let sql = `
                SELECT u.*, r.name as role_name
                FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE LOWER(TRIM(u.email)) = ?
            `;
            
            try {
                const result = await query(sql, [normalizedEmail]);
                return result[0] || null;
            } catch (error) {
                if (error.code === 'ER_BAD_FIELD_ERROR' || (error.message && error.message.includes('Unknown column'))) {
                    sql = `
                        SELECT u.*, r.nombre as role_name
                        FROM users u
                        JOIN roles r ON u.role_id = r.id
                        WHERE LOWER(TRIM(u.email)) = ?
                    `;
                    const result = await query(sql, [normalizedEmail]);
                    return result[0] || null;
                }
                throw error;
            }
        } catch (error) {
            console.error('Error en findByEmail:', error);
            console.error('Email buscado:', email);
            throw error;
        }
    }

    static async findById(id) {
        let sql = `
            SELECT u.*, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = ?
        `;
        
        try {
            const result = await query(sql, [id]);
            return result[0] || null;
        } catch (error) {
            if (error.code === 'ER_BAD_FIELD_ERROR' || (error.message && error.message.includes('Unknown column'))) {
                sql = `
                    SELECT u.*, r.nombre as role_name
                    FROM users u
                    JOIN roles r ON u.role_id = r.id
                    WHERE u.id = ?
                `;
                const result = await query(sql, [id]);
                return result[0] || null;
            }
            throw error;
        }
    }

    static async verifyPassword(password, passwordHash) {
        return await bcrypt.compare(password, passwordHash);
    }

    static async verifyEmail(id) {
        const sql = 'UPDATE users SET email_verified = TRUE WHERE id = ?';
        await query(sql, [id]);
    }

    static async updatePassword(id, newPassword) {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        const sql = 'UPDATE users SET password = ? WHERE id = ?';
        await query(sql, [passwordHash, id]);
    }
 
    static async updateProfile(id, { full_name, phone, incident_area_id }) {
        // Mantener department sincronizado con el nombre de la dirección
        let department = null;
        if (incident_area_id) {
            try {
                let direccion;
                try {
                    direccion = await query(
                        'SELECT name FROM incident_areas WHERE id = ?',
                        [incident_area_id]
                    );
                } catch (error) {
                    if (error.code === 'ER_BAD_FIELD_ERROR' || error.message?.includes('Unknown column')) {
                        direccion = await query(
                            'SELECT nombre as name FROM incident_areas WHERE id = ?',
                            [incident_area_id]
                        );
                    } else {
                        throw error;
                    }
                }
                department = direccion[0]?.name || null;
            } catch (error) {
                console.error('Error al obtener nombre de dirección al actualizar perfil:', error);
                department = null;
            }
        }

        const sql = `
            UPDATE users
            SET full_name = ?, phone = ?, department = ?, incident_area_id = ?
            WHERE id = ?
        `;

        try {
            await query(sql, [full_name, phone || null, department, incident_area_id || null, id]);
        } catch (error) {
            console.error('Error al actualizar usuario en updateProfile:', error);
            console.error('SQL:', sql);
            console.error('Parámetros:', [full_name, phone || null, department, incident_area_id || null, id]);
            throw error;
        }

        try {
            return await this.findById(id);
        } catch (error) {
            console.error('Error al obtener usuario actualizado:', error);
            throw error;
        }
    }

    static async updateSecurityQuestions(id, { question1, answer1, question2, answer2 }) {
        try {
            const answer1Hash = answer1 ? await bcrypt.hash(answer1.toLowerCase().trim(), 10) : null;
            const answer2Hash = answer2 ? await bcrypt.hash(answer2.toLowerCase().trim(), 10) : null;

            const sql = `
                UPDATE users
                SET security_question_1 = ?, security_answer_1 = ?,
                    security_question_2 = ?, security_answer_2 = ?
                WHERE id = ?
            `;

            await query(sql, [
                question1 || null,
                answer1Hash,
                question2 || null,
                answer2Hash,
                id
            ]);

            return this.findById(id);
        } catch (error) {
            console.error('Error en updateSecurityQuestions:', error);
            throw error;
        }
    }

    static async verifySecurityAnswers(id, { answer1, answer2 }) {
        const user = await this.findById(id);
        
        if (!user || !user.security_question_1 || !user.security_question_2) {
            return false;
        }

        const answer1Valid = user.security_answer_1 
            ? await bcrypt.compare(answer1.toLowerCase().trim(), user.security_answer_1)
            : false;
        
        const answer2Valid = user.security_answer_2
            ? await bcrypt.compare(answer2.toLowerCase().trim(), user.security_answer_2)
            : false;

        return answer1Valid && answer2Valid;
    }

    static async getSecurityQuestions(email) {
        try {
            const user = await this.findByEmail(email);
            
            if (!user) {
                return null;
            }

            if (!user.security_question_1 || !user.security_question_2) {
                return null;
            }

            return {
                question1: user.security_question_1,
                question2: user.security_question_2
            };
        } catch (error) {
            console.error('Error en getSecurityQuestions:', error);
            throw error;
        }
    }

    static async emailExists(email) {
        const normalizedEmail = this.normalizeEmail(email);
        const sql = 'SELECT id FROM users WHERE LOWER(TRIM(email)) = ?';
        const result = await query(sql, [normalizedEmail]);
        return result.length > 0;
    }

    static async update(id, data) {
        const { full_name, email, phone, incident_area_id, role_id, active, password } = data;
        
        // Obtener nombre de la dirección para mantener el campo department sincronizado
        let department = null;
        if (incident_area_id !== undefined) {
            if (incident_area_id) {
                try {
                    const direccion = await query(
                        'SELECT name FROM incident_areas WHERE id = ?',
                        [incident_area_id]
                    );
                    department = direccion[0]?.name || null;
                } catch (error) {
                    console.error('Error al obtener nombre de dirección:', error);
                }
            } else {
                department = null;
            }
        }

        const updates = [];
        const params = [];

        if (full_name !== undefined) {
            updates.push('full_name = ?');
            params.push(full_name);
        }
        if (email !== undefined) {
            const normalizedEmail = this.normalizeEmail(email);
            updates.push('email = ?');
            params.push(normalizedEmail);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            params.push(phone || null);
        }
        if (incident_area_id !== undefined) {
            updates.push('incident_area_id = ?');
            params.push(incident_area_id || null);
            if (department !== undefined) {
                updates.push('department = ?');
                params.push(department);
            }
        }
        if (role_id !== undefined) {
            updates.push('role_id = ?');
            params.push(Number(role_id));
        }
        if (active !== undefined) {
            updates.push('active = ?');
            params.push(active === true ? 1 : 0);
        }
        if (password !== undefined && password !== null && password !== '') {
            const passwordHash = await bcrypt.hash(password, 10);
            updates.push('password = ?');
            params.push(passwordHash);
        }

        if (updates.length === 0) {
            throw new Error('No hay campos para actualizar');
        }

        params.push(id);
        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        
        await query(sql, params);
        return await this.findById(id);
    }

    static async delete(id) {
        const sql = 'DELETE FROM users WHERE id = ?';
        await query(sql, [id]);
    }

    static async findAll(filters = {}) {
        const { active, role_id, search, page = 1, limit = 10, orderBy = 'created_at', orderDirection = 'DESC' } = filters;
        
        try {
            let sql = `
                SELECT u.*, r.name as role_name
                FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE 1=1
            `;
            const params = [];

            if (active !== undefined) {
                sql += ' AND u.active = ?';
                params.push(active === true ? 1 : 0);
            }

            if (role_id !== undefined) {
                sql += ' AND u.role_id = ?';
                params.push(role_id);
            }

            if (search) {
                sql += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm);
            }

            const validOrderColumns = ['id', 'full_name', 'email', 'created_at', 'updated_at', 'active'];
            const orderColumn = validOrderColumns.includes(orderBy) ? orderBy : 'created_at';
            const orderDir = orderDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
            sql += ` ORDER BY u.${orderColumn} ${orderDir}`;

            const offset = (page - 1) * limit;
            sql += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);

            let users;
            try {
                users = await query(sql, params);
            } catch (error) {
                if (error.code === 'ER_BAD_FIELD_ERROR' || (error.message && error.message.includes('Unknown column')) || error.message.includes('Table')) {
                    console.warn('Error con nombres en inglés, intentando con nombres en español...');
                    sql = `
                        SELECT u.*, r.nombre as role_name
                        FROM usuarios u
                        JOIN roles r ON u.role_id = r.id
                        WHERE 1=1
                    `;
                    const paramsEsp = [];
                    
                    if (active !== undefined) {
                        sql += ' AND u.activo = ?';
                        paramsEsp.push(active === true ? 1 : 0);
                    }
                    if (role_id !== undefined) {
                        sql += ' AND u.role_id = ?';
                        paramsEsp.push(role_id);
                    }
                    if (search) {
                        sql += ' AND (u.nombre_completo LIKE ? OR u.email LIKE ?)';
                        const searchTerm = `%${search}%`;
                        paramsEsp.push(searchTerm, searchTerm);
                    }
                    sql += ` ORDER BY u.${orderColumn} ${orderDir}`;
                    sql += ' LIMIT ? OFFSET ?';
                    paramsEsp.push(limit, offset);
                    
                    users = await query(sql, paramsEsp);
                } else {
                    throw error;
                }
            }

            // Convertir BigInt a Number para todos los campos numéricos de usuarios
            users = users.map(user => {
                const userObj = { ...user };
                // Convertir IDs y campos numéricos de BigInt a Number
                if (typeof userObj.id === 'bigint') userObj.id = Number(userObj.id);
                if (typeof userObj.role_id === 'bigint') userObj.role_id = Number(userObj.role_id);
                if (typeof userObj.incident_area_id === 'bigint') userObj.incident_area_id = Number(userObj.incident_area_id);
                // Convertir booleanos de 0/1 a true/false
                if (typeof userObj.active === 'number') userObj.active = userObj.active === 1;
                if (typeof userObj.email_verified === 'number') userObj.email_verified = userObj.email_verified === 1;
                return userObj;
            });

            let countSql = `
                SELECT COUNT(*) as total
                FROM users u
                WHERE 1=1
            `;
            const countParams = [];

            if (active !== undefined) {
                countSql += ' AND u.active = ?';
                countParams.push(active === true ? 1 : 0);
            }

            if (role_id !== undefined) {
                countSql += ' AND u.role_id = ?';
                countParams.push(role_id);
            }

            if (search) {
                countSql += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
                const searchTerm = `%${search}%`;
                countParams.push(searchTerm, searchTerm);
            }

            const countResult = await query(countSql, countParams);
            const total = countResult[0]?.total || 0;
            
            // Convertir BigInt a Number explícitamente
            const totalNumber = typeof total === 'bigint' ? Number(total) : Number(total);
            const pageNumber = Number(page);
            const limitNumber = Number(limit);

            return {
                users,
                pagination: {
                    page: pageNumber,
                    limit: limitNumber,
                    total: totalNumber,
                    totalPages: Math.ceil(totalNumber / limitNumber)
                }
            };
        } catch (error) {
            console.error('Error en Usuario.findAll:', error);
            console.error('Filtros aplicados:', filters);
            throw error;
        }
    }

    static async updateActiveStatus(id, active) {
        const sql = 'UPDATE users SET active = ? WHERE id = ?';
        await query(sql, [active === true ? 1 : 0, id]);
        return await this.findById(id);
    }

    static async getUserStats() {
        const sql = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as active_count,
                SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) as inactive_count,
                SUM(CASE WHEN email_verified = 1 THEN 1 ELSE 0 END) as verified_count,
                SUM(CASE WHEN email_verified = 0 THEN 1 ELSE 0 END) as unverified_count,
                SUM(CASE WHEN active = 1 AND email_verified = 1 THEN 1 ELSE 0 END) as active_verified_count,
                SUM(CASE WHEN active = 0 AND email_verified = 1 THEN 1 ELSE 0 END) as inactive_verified_count
            FROM users
        `;
        const result = await query(sql);
        return result[0] || null;
    }
}

export default Usuario;

