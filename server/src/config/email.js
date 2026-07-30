// Email: Gmail SMTP (local) o SendGrid API HTTP (producción en Render)
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { sendSendGridEmail, verifySendGridConfig } from '../lib/sendgridEmail.js';
import { debugLog } from '../lib/debugLog.js';

dotenv.config();

const useSendGrid = process.env.EMAIL_PROVIDER === 'sendgrid';

let transporter = null;

if (!useSendGrid) {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    transporter.verify((error) => {
        if (error) {
            console.error('Error en configuración de email:', error.message);
        } else {
            console.log('Servidor de email listo (SMTP)');
        }
    });
} else {
    verifySendGridConfig();
}

async function dispatchEmail({ to, subject, html }) {
    // #region agent log
    debugLog(
        'email.js:dispatchEmail',
        'dispatch start',
        {
            useSendGrid,
            emailProvider: process.env.EMAIL_PROVIDER || '(unset)',
            sendgridKeySet: Boolean(process.env.SENDGRID_API_KEY),
            smtpUserSet: Boolean(process.env.EMAIL_USER),
            emailFromSet: Boolean(process.env.EMAIL_FROM),
            frontendUrlSet: Boolean(process.env.FRONTEND_URL),
        },
        'H1'
    );
    // #endregion

    try {
        if (useSendGrid) {
            return await sendSendGridEmail({ to, subject, html });
        }

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
        });
        return true;
    } catch (error) {
        // #region agent log
        debugLog(
            'email.js:dispatchEmail',
            'dispatch failed',
            {
                useSendGrid,
                errorMessage: error?.message,
                errorCode: error?.code,
                sendgridStatus: error?.response?.statusCode ?? error?.response?.code,
            },
            useSendGrid ? 'H2' : 'H1'
        );
        // #endregion
        throw error;
    }
}

export const enviarEmailVerificacion = async (email, token, name) => {
    const url = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;

    try {
        await dispatchEmail({
            to: email,
            subject: 'Verificación de Email - Sistema de Soporte Técnico',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Verificación de Email</h2>
                <p>Hola ${name},</p>
                <p>Gracias por registrarte en el Sistema de Gestión de Soporte Técnico.</p>
                <p>Por favor, verifica tu dirección de email haciendo clic en el siguiente enlace:</p>
                <p style="margin: 30px 0;">
                    <a href="${url}" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verificar Email
                    </a>
                </p>
                <p>O copia y pega este enlace en tu navegador:</p>
                <p style="color: #666; word-break: break-all;">${url}</p>
                <p>Este enlace expirará en 24 horas.</p>
            </div>
        `,
        });
        return true;
    } catch (error) {
        console.error('Error al enviar email de verificación:', error);
        throw error;
    }
};

export const enviarEmailRecuperacion = async (email, token, name) => {
    const url = `${process.env.FRONTEND_URL}/restablecer-password?token=${token}`;

    try {
        await dispatchEmail({
            to: email,
            subject: 'Recuperación de Contraseña - Sistema de Soporte Técnico',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Recuperación de Contraseña</h2>
                <p>Hola ${name},</p>
                <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
                <p style="margin: 30px 0;">
                    <a href="${url}" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Restablecer Contraseña
                    </a>
                </p>
                <p>O copia y pega este enlace en tu navegador:</p>
                <p style="color: #666; word-break: break-all;">${url}</p>
                <p>Este enlace expirará en 1 hora.</p>
            </div>
        `,
        });
        return true;
    } catch (error) {
        console.error('Error al enviar email de recuperación:', error);
        throw error;
    }
};

export const enviarEmailAsignacion = async (email, name, ticketTitulo, ticketId) => {
    const url = `${process.env.FRONTEND_URL}/tickets/${ticketId}`;

    try {
        await dispatchEmail({
            to: email,
            subject: 'Nuevo Ticket Asignado - Sistema de Soporte Técnico',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Nuevo Ticket Asignado</h2>
                <p>Hola ${name},</p>
                <p>Se te ha asignado un nuevo ticket de soporte técnico.</p>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Título:</strong> ${ticketTitulo}</p>
                    <p style="margin: 5px 0 0 0;"><strong>ID del Ticket:</strong> ${ticketId}</p>
                </div>
                <p style="margin: 30px 0;">
                    <a href="${url}" 
                       style="background-color: #2563eb; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Ver Ticket
                    </a>
                </p>
                <p style="color: #666; word-break: break-all;">${url}</p>
            </div>
        `,
        });
        return true;
    } catch (error) {
        console.error('Error al enviar email de asignación:', error);
        throw error;
    }
};

export default transporter;
