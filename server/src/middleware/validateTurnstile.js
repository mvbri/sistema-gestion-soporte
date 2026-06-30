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

        // #region agent log
        fetch('http://127.0.0.1:7304/ingest/20b01933-ba4f-418f-881b-434a9d7e19c8',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2d335f'},body:JSON.stringify({sessionId:'2d335f',location:'validateTurnstile.js:verify',message:'turnstile verify result',data:{success:!!result.success,errorCodes:result['error-codes']??[]},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
        // #endregion

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
