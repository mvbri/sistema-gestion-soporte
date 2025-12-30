// Configuración de Nodemailer para envío de emails (gratuito con Gmail SMTP)
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Crear transporter con Gmail SMTP (gratuito)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true para SSL/TLS, false para STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificar conexión al iniciar
transporter.verify((error, success) => {
    if (error) {
        console.error('Error en configuración de email:', error);
    } else {
        console.log('Servidor de email listo para enviar mensajes');
    }
});

export const enviarEmailVerificacion = async (email, token, name) => {
    const url = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_FROM,
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
                <p style="margin-top: 30px; color: #666; font-size: 12px;">
                    Si no solicitaste este registro, puedes ignorar este email.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error al enviar email de verificación:', error);
        throw error;
    }
};

export const enviarEmailRecuperacion = async (email, token, name) => {
    const url = `${process.env.FRONTEND_URL}/restablecer-password?token=${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_FROM,
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
                <p style="margin-top: 30px; color: #666; font-size: 12px;">
                    Si no solicitaste este cambio, puedes ignorar este email y tu contraseña permanecerá sin cambios.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error al enviar email de recuperación:', error);
        throw error;
    }
};

export default transporter;

