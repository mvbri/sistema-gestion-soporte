const DEBUG_INGEST_URL =
    'http://127.0.0.1:7304/ingest/20b01933-ba4f-418f-881b-434a9d7e19c8';
const DEBUG_SESSION_ID = 'b589dc';

/**
 * Registra diagnóstico de depuración (consola + ingest local). No incluir secretos ni PII.
 * @param {string} location
 * @param {string} message
 * @param {Record<string, unknown>} data
 * @param {string} hypothesisId
 */
export function debugLog(location, message, data = {}, hypothesisId = '') {
    const payload = {
        sessionId: DEBUG_SESSION_ID,
        location,
        message,
        data,
        hypothesisId,
        timestamp: Date.now(),
    };

    // #region agent log
    fetch(DEBUG_INGEST_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': DEBUG_SESSION_ID,
        },
        body: JSON.stringify(payload),
    }).catch(() => {});
    // #endregion

    console.error('[DEBUG email]', JSON.stringify(payload));
}

/**
 * Estado de configuración de email sin exponer secretos (para /api/health).
 */
export function getEmailConfigStatus() {
    const provider = process.env.EMAIL_PROVIDER?.trim() || 'smtp';
    const useSendGrid = provider === 'sendgrid';

    return {
        provider,
        useSendGrid,
        sendgridKeySet: Boolean(process.env.SENDGRID_API_KEY?.trim()),
        emailFromSet: Boolean(process.env.EMAIL_FROM?.trim()),
        smtpUserSet: Boolean(process.env.EMAIL_USER?.trim()),
        smtpPassSet: Boolean(process.env.EMAIL_PASS?.trim()),
        frontendUrlSet: Boolean(process.env.FRONTEND_URL?.trim()),
        expectedTransport: useSendGrid ? 'sendgrid-api' : 'smtp-nodemailer',
        misconfiguredProvider: provider !== 'sendgrid' && provider !== 'smtp' && provider !== '',
    };
}
