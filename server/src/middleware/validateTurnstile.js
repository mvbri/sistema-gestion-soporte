import { verifyTurnstileToken } from '../services/turnstileService.js';
import { sendError } from '../utils/responseHandler.js';

/**
 * Middleware que valida el token de Cloudflare Turnstile antes de procesar la solicitud.
 * Espera `turnstileToken` en el body de la petición.
 */
export const validateTurnstile = async (req, res, next) => {
    const token = req.body?.turnstileToken;

    if (!token || typeof token !== 'string') {
        return sendError(res, 'Verificación de seguridad requerida', null, 400);
    }

    try {
        const result = await verifyTurnstileToken(token, req.ip);

        if (!result.success) {
            return sendError(
                res,
                'Verificación de seguridad inválida. Intenta nuevamente.',
                null,
                403
            );
        }

        return next();
    } catch (error) {
        console.error('Error al verificar Turnstile:', error.message);
        return sendError(
            res,
            'No se pudo verificar la seguridad. Intenta más tarde.',
            null,
            503
        );
    }
};
