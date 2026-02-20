import { query } from '../config/database.js';
import { randomUUID } from 'crypto';

class Ticket {
    static async create(data) {
        const {
            titulo,
            descripcion,
            area_incidente,
            categoria_id,
            prioridad_id,
            usuario_creador_id,
            imagen_url
        } = data;

        const ticketId = randomUUID();

        const sql = `
            INSERT INTO tickets (
                id, titulo, descripcion, area_incidente, categoria_id,
                prioridad_id, estado_id, usuario_creador_id, imagen_url
            )
            VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
        `;

        await query(sql, [
            ticketId,
            titulo,
            descripcion,
            area_incidente,
            categoria_id,
            prioridad_id,
            usuario_creador_id,
            imagen_url || null
        ]);

        return await this.findById(ticketId);
    }

    static async findById(id) {
        const sql = `
            SELECT 
                t.*,
                c.nombre as categoria_nombre,
                p.nombre as prioridad_nombre,
                p.color as prioridad_color,
                p.nivel as prioridad_nivel,
                e.nombre as estado_nombre,
                e.color as estado_color,
                u1.full_name as usuario_creador_nombre,
                u1.email as usuario_creador_email,
                u2.full_name as tecnico_asignado_nombre,
                u2.email as tecnico_asignado_email
            FROM tickets t
            LEFT JOIN categorias_ticket c ON t.categoria_id = c.id
            LEFT JOIN prioridades_ticket p ON t.prioridad_id = p.id
            LEFT JOIN estados_ticket e ON t.estado_id = e.id
            LEFT JOIN usuarios u1 ON t.usuario_creador_id = u1.id
            LEFT JOIN usuarios u2 ON t.tecnico_asignado_id = u2.id
            WHERE t.id = ?
        `;

        const result = await query(sql, [id]);
        return result[0] || null;
    }

    static async findAll(filters = {}) {
        let sql = `
            SELECT 
                t.*,
                c.nombre as categoria_nombre,
                p.nombre as prioridad_nombre,
                p.color as prioridad_color,
                p.nivel as prioridad_nivel,
                e.nombre as estado_nombre,
                e.color as estado_color,
                u1.full_name as usuario_creador_nombre,
                u1.email as usuario_creador_email,
                u2.full_name as tecnico_asignado_nombre,
                u2.email as tecnico_asignado_email
            FROM tickets t
            LEFT JOIN categorias_ticket c ON t.categoria_id = c.id
            LEFT JOIN prioridades_ticket p ON t.prioridad_id = p.id
            LEFT JOIN estados_ticket e ON t.estado_id = e.id
            LEFT JOIN usuarios u1 ON t.usuario_creador_id = u1.id
            LEFT JOIN usuarios u2 ON t.tecnico_asignado_id = u2.id
            WHERE 1=1
        `;

        const params = [];

        if (filters.usuario_creador_id) {
            sql += ' AND t.usuario_creador_id = ?';
            params.push(filters.usuario_creador_id);
        }

        if (filters.tecnico_asignado_id) {
            sql += ' AND t.tecnico_asignado_id = ?';
            params.push(filters.tecnico_asignado_id);
        }

        if (filters.estado_id) {
            sql += ' AND t.estado_id = ?';
            params.push(filters.estado_id);
        }

        if (filters.categoria_id) {
            sql += ' AND t.categoria_id = ?';
            params.push(filters.categoria_id);
        }

        if (filters.prioridad_id) {
            sql += ' AND t.prioridad_id = ?';
            params.push(filters.prioridad_id);
        }

        if (filters.busqueda) {
            sql += ' AND (t.titulo LIKE ? OR t.descripcion LIKE ?)';
            const searchTerm = `%${filters.busqueda}%`;
            params.push(searchTerm, searchTerm);
        }

        if (filters.fecha_desde) {
            sql += ' AND DATE(t.fecha_creacion) >= ?';
            params.push(filters.fecha_desde);
        }

        if (filters.fecha_hasta) {
            sql += ' AND DATE(t.fecha_creacion) <= ?';
            params.push(filters.fecha_hasta);
        }

        sql += ' ORDER BY t.fecha_creacion DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
            if (filters.offset) {
                sql += ' OFFSET ?';
                params.push(filters.offset);
            }
        }

        return await query(sql, params);
    }

    static async update(id, data) {
        const {
            titulo,
            descripcion,
            area_incidente,
            categoria_id,
            prioridad_id,
            estado_id,
            tecnico_asignado_id
        } = data;

        const updates = [];
        const params = [];

        if (titulo !== undefined) {
            updates.push('titulo = ?');
            params.push(titulo);
        }

        if (descripcion !== undefined) {
            updates.push('descripcion = ?');
            params.push(descripcion);
        }

        if (area_incidente !== undefined) {
            updates.push('area_incidente = ?');
            params.push(area_incidente);
        }

        if (categoria_id !== undefined) {
            updates.push('categoria_id = ?');
            params.push(categoria_id);
        }

        if (prioridad_id !== undefined) {
            updates.push('prioridad_id = ?');
            params.push(prioridad_id);
        }

        if (estado_id !== undefined) {
            updates.push('estado_id = ?');
            params.push(estado_id);
            
            if (estado_id === 5) {
                updates.push('fecha_cierre = NOW()');
            }
        }

        if (tecnico_asignado_id !== undefined) {
            updates.push('tecnico_asignado_id = ?');
            params.push(tecnico_asignado_id);
        }

        if (updates.length === 0) {
            return await this.findById(id);
        }

        params.push(id);
        const sql = `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`;

        await query(sql, params);
        return await this.findById(id);
    }

    static async delete(id) {
        const sql = 'DELETE FROM tickets WHERE id = ?';
        await query(sql, [id]);
        return true;
    }

    static async count(filters = {}) {
        let sql = 'SELECT COUNT(*) as total FROM tickets WHERE 1=1';
        const params = [];

        if (filters.usuario_creador_id) {
            sql += ' AND usuario_creador_id = ?';
            params.push(filters.usuario_creador_id);
        }

        if (filters.tecnico_asignado_id) {
            sql += ' AND tecnico_asignado_id = ?';
            params.push(filters.tecnico_asignado_id);
        }

        if (filters.estado_id) {
            sql += ' AND estado_id = ?';
            params.push(filters.estado_id);
        }

        const result = await query(sql, params);
        const rawTotal = result[0]?.total ?? 0;
        // El driver puede devolver COUNT(*) como BigInt, lo convertimos explícitamente a Number
        return typeof rawTotal === 'bigint' ? Number(rawTotal) : rawTotal;
    }

    static async getStats() {
        const sql = `
            SELECT 
                e.id as estado_id,
                e.nombre as estado_nombre,
                e.color as estado_color,
                COUNT(t.id) as cantidad
            FROM estados_ticket e
            LEFT JOIN tickets t ON e.id = t.estado_id
            WHERE e.activo = TRUE
            GROUP BY e.id, e.nombre, e.color
            ORDER BY e.orden
        `;

        return await query(sql);
    }

    static async getStatsByCategory() {
        const sql = `
            SELECT 
                c.id,
                c.nombre,
                COUNT(t.id) as cantidad
            FROM categorias_ticket c
            LEFT JOIN tickets t ON c.id = t.categoria_id
            WHERE c.activo = TRUE
            GROUP BY c.id, c.nombre
            ORDER BY cantidad DESC
        `;

        return await query(sql);
    }

    static async getStatsByPriority() {
        const sql = `
            SELECT 
                p.id,
                p.nombre,
                p.color,
                COUNT(t.id) as cantidad
            FROM prioridades_ticket p
            LEFT JOIN tickets t ON p.id = t.prioridad_id
            WHERE p.activo = TRUE
            GROUP BY p.id, p.nombre, p.color
            ORDER BY p.nivel DESC
        `;

        return await query(sql);
    }
}

export default Ticket;
