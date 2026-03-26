import { query } from '../config/database.js';

class FrequentIssue {
    /**
     * Obtiene todas las fallas frecuentes.
     * @param {boolean} activeOnly
     * @returns {Promise<Array>}
     */
    static async findAll(activeOnly = true) {
        let sql = `
            SELECT id, title, symptoms, possible_solution, category_id, active, created_at, updated_at
            FROM frequent_issues
        `;
        const params = [];

        if (activeOnly) {
            sql += ' WHERE active = TRUE';
        }

        sql += ' ORDER BY title ASC';

        return query(sql, params);
    }

    /**
     * Busca una falla frecuente por id.
     * @param {number|string} id
     * @returns {Promise<object|null>}
     */
    static async findById(id) {
        const sql = `
            SELECT id, title, symptoms, possible_solution, category_id, active, created_at, updated_at
            FROM frequent_issues
            WHERE id = ?
        `;
        const result = await query(sql, [id]);
        return result[0] || null;
    }

    /**
     * Crea una falla frecuente.
     * @param {object} data
     * @returns {Promise<object>}
     */
    static async create(data) {
        const { title, symptoms, possible_solution, category_id, active } = data;
        const sql = `
            INSERT INTO frequent_issues (title, symptoms, possible_solution, category_id, active)
            VALUES (?, ?, ?, ?, ?)
        `;
        const result = await query(sql, [
            title,
            symptoms || null,
            possible_solution,
            category_id || null,
            active ?? true
        ]);
        return this.findById(result.insertId);
    }

    /**
     * Actualiza una falla frecuente.
     * @param {number|string} id
     * @param {object} data
     * @returns {Promise<object|null>}
     */
    static async update(id, data) {
        const updates = [];
        const params = [];

        if (data.title !== undefined) {
            updates.push('title = ?');
            params.push(data.title);
        }
        if (data.symptoms !== undefined) {
            updates.push('symptoms = ?');
            params.push(data.symptoms);
        }
        if (data.possible_solution !== undefined) {
            updates.push('possible_solution = ?');
            params.push(data.possible_solution);
        }
        if (data.category_id !== undefined) {
            updates.push('category_id = ?');
            params.push(data.category_id);
        }
        if (data.active !== undefined) {
            updates.push('active = ?');
            params.push(data.active);
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        params.push(id);
        const sql = `UPDATE frequent_issues SET ${updates.join(', ')} WHERE id = ?`;
        await query(sql, params);
        return this.findById(id);
    }

    /**
     * Elimina una falla frecuente.
     * @param {number|string} id
     * @returns {Promise<void>}
     */
    static async delete(id) {
        await query('DELETE FROM frequent_issues WHERE id = ?', [id]);
    }
}

export default FrequentIssue;
