// Utilidades para generar tokens seguros
import crypto from 'crypto';

// Generar token aleatorio seguro
export const generarTokenSeguro = (longitud = 32) => {
    return crypto.randomBytes(longitud).toString('hex');
};

// Generar token de verificación
export const generarTokenVerificacion = () => {
    return generarTokenSeguro(32);
};


