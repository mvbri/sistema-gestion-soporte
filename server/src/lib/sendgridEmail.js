import sgMail from '@sendgrid/mail';

let apiKeyConfigured = false;

function ensureApiKey() {
    if (!apiKeyConfigured) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        apiKeyConfigured = true;
    }
}

/**
 * Convierte errores de la API de SendGrid en mensajes legibles para el cliente.
 * @param {unknown} error - Error lanzado por @sendgrid/mail.
 * @returns {Error}
 */
function toSendGridUserError(error) {
    const response = error?.response;
    const statusCode = response?.statusCode ?? response?.code;
    const apiErrors = response?.body?.errors;

    if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        const detail = apiErrors.map((entry) => entry.message).filter(Boolean).join(' ');
        if (statusCode === 403) {
            return new Error(
                'No se pudo enviar el correo: SendGrid rechazó la solicitud. Verifica SENDGRID_API_KEY y que EMAIL_FROM esté verificado como remitente.'
            );
        }
        return new Error(`No se pudo enviar el correo: ${detail}`);
    }

    if (statusCode === 403 || error?.message === 'Forbidden') {
        return new Error(
            'No se pudo enviar el correo: SendGrid rechazó la solicitud. Verifica SENDGRID_API_KEY y que EMAIL_FROM esté verificado como remitente.'
        );
    }

    if (error instanceof Error && error.message?.trim()) {
        return error;
    }

    return new Error('No se pudo enviar el correo de verificación. Intenta más tarde.');
}

export async function sendSendGridEmail({ to, subject, html }) {
    const from = process.env.EMAIL_FROM;

    if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY no configurada');
    }
    if (!from) {
        throw new Error('EMAIL_FROM no configurado');
    }

    ensureApiKey();

    try {
        await sgMail.send({
            to,
            from,
            subject,
            html,
        });
    } catch (error) {
        console.error('Error SendGrid:', error?.response?.body ?? error);
        throw toSendGridUserError(error);
    }

    return true;
}

export function verifySendGridConfig() {
    if (!process.env.SENDGRID_API_KEY) {
        console.error('Error en configuración de email: falta SENDGRID_API_KEY');
        return;
    }
    if (!process.env.EMAIL_FROM) {
        console.error('Error en configuración de email: falta EMAIL_FROM');
        return;
    }
    console.log('Email SendGrid configurado (API HTTP)');
}
