// Modelo de Usuario
import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

class Usuario {
    static async create(data) {
        const { full_name, email, password, phone, department, role_id = 3 } = data;
        
        const passwordHash = await bcrypt.hash(password, 10);
        
        const sql = `
            INSERT INTO usuarios (full_name, email, password, phone, department, role_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const result = await query(sql, [full_name, email, passwordHash, phone || null, department || null, role_id]);
        
        return {
            id: Number(result.insertId),
            full_name,
            email,
            phone,
            department,
            role_id: Number(role_id),
            email_verified: false
        };
    }

    static async findByEmail(email) {
        try {
            const sql = `
                SELECT u.*, r.name as role_name
                FROM usuarios u
                JOIN roles r ON u.role_id = r.id
                WHERE u.email = ?
            `;
            
            const result = await query(sql, [email]);
            return result[0] || null;
        } catch (error) {
            console.error('Error en findByEmail:', error);
            console.error('Email buscado:', email);
            throw error;
        }
    }

    static async findById(id) {
        const sql = `
            SELECT u.*, r.name as role_name
            FROM usuarios u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = ?
        `;
        
        const result = await query(sql, [id]);
        return result[0] || null;
    }

    static async verifyPassword(password, passwordHash) {
        return await bcrypt.compare(password, passwordHash);
    }

    static async verifyEmail(id) {
        const sql = 'UPDATE usuarios SET email_verified = TRUE WHERE id = ?';
        await query(sql, [id]);
    }

    static async updatePassword(id, newPassword) {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        const sql = 'UPDATE usuarios SET password = ? WHERE id = ?';
        await query(sql, [passwordHash, id]);
    }

    static async updateProfile(id, { full_name, phone, department }) {
        const sql = `
            UPDATE usuarios
            SET full_name = ?, phone = ?, department = ?
            WHERE id = ?
        `;

        await query(sql, [full_name, phone || null, department, id]);

        return this.findById(id);
    }

    static async updateSecurityQuestions(id, { question1, answer1, question2, answer2 }) {
        try {
            const answer1Hash = answer1 ? await bcrypt.hash(answer1.toLowerCase().trim(), 10) : null;
            const answer2Hash = answer2 ? await bcrypt.hash(answer2.toLowerCase().trim(), 10) : null;

            const sql = `
                UPDATE usuarios
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
        const user = await this.findByEmail(email);
        
        if (!user || !user.security_question_1 || !user.security_question_2) {
            return null;
        }

        return {
            question1: user.security_question_1,
            question2: user.security_question_2
        };
    }

    static async emailExists(email) {
        const sql = 'SELECT id FROM usuarios WHERE email = ?';
        const result = await query(sql, [email]);
        return result.length > 0;
    }

    static async delete(id) {
        const sql = 'DELETE FROM usuarios WHERE id = ?';
        await query(sql, [id]);
    }
}

export default Usuario;

