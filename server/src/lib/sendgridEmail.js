import sgMail from '@sendgrid/mail';

let apiKeyConfigured = false;

function ensureApiKey() {
    if (!apiKeyConfigured) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        apiKeyConfigured = true;
    }
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

    await sgMail.send({
        to,
        from,
        subject,
        html,
    });

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
