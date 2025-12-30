// Utilidades para JWT
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generar token JWT
export const generarToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

// Verificar token JWT
export const verificarToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }
};

import { sendError } from './responseHandler.js';

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return sendError(res, 'Token de autenticación requerido', null, 401);
        }

        const token = authHeader.substring(7);
        const decoded = verificarToken(token);
        
        req.user = decoded;
        next();
    } catch (error) {
        return sendError(res, error.message || 'Token inválido', null, 401);
    }
};

