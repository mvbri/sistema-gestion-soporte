// Controlador de autenticación
import Usuario from '../models/Usuario.js';
import Token from '../models/Token.js';
import { generarToken } from '../utils/jwt.js';
import { generarTokenVerificacion } from '../utils/crypto.js';
import { enviarEmailVerificacion, enviarEmailRecuperacion } from '../config/email.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

// Registro de nuevo usuario
export const register = async (req, res) => {
    let userId = null;
    let tokenCreated = false;
    let emailSent = false;

    try {
        const { full_name, email, password, phone, department } = req.body;

        const emailExists = await Usuario.emailExists(email);
        if (emailExists) {
            return sendError(res, 'El email ya está registrado');
        }

        const user = await Usuario.create({
            full_name,
            email,
            password,
            phone,
            department
        });
        userId = user.id;

        const verificationToken = generarTokenVerificacion();
        await Token.create(user.id, verificationToken, 'email_verification', 24);
        tokenCreated = true;

        // Solo enviar correo si todo fue exitoso hasta este punto
        await enviarEmailVerificacion(email, verificationToken, full_name);
        emailSent = true;

        const responseData = {
            id: user.id,
            full_name: user.full_name,
            email: user.email
        };

        sendSuccess(
            res,
            'Usuario registrado exitosamente. Por favor verifica tu email.',
            responseData,
            201
        );
    } catch (error) {
        console.error('Error en registro:', error);
        console.error('Stack trace:', error.stack);
        console.error('Estado del proceso - userId:', userId, 'tokenCreated:', tokenCreated, 'emailSent:', emailSent);

        // Solo limpiar recursos si el correo NO se envió (no queremos eliminar usuarios con correos enviados)
        if (userId && !emailSent) {
            // Si se creó el token, eliminarlo primero
            if (tokenCreated) {
                try {
                    await Token.deleteByUser(userId, 'email_verification');
                    console.log('Token eliminado correctamente');
                } catch (cleanupError) {
                    console.error('Error al limpiar token después de fallo:', cleanupError);
                }
            }
            
            // Eliminar el usuario solo si el correo no se envió
            try {
                await Usuario.delete(userId);
                console.log('Usuario eliminado correctamente');
            } catch (cleanupError) {
                console.error('Error al limpiar usuario después de fallo:', cleanupError);
                console.error('Detalles del error de limpieza:', cleanupError.message);
            }
        } else if (emailSent) {
            console.log('El correo se envió exitosamente, no se eliminarán los recursos');
        }

        const errorMessage = error.message || 'Error al registrar usuario';
        sendError(res, errorMessage, null, 500);
    }
};

// Login de usuario
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await Usuario.findByEmail(email);
        if (!user) {
            return sendError(res, 'Credenciales inválidas', null, 401);
        }

        if (!user.active) {
            return sendError(res, 'Tu cuenta está desactivada. Contacta al administrador.', null, 401);
        }

        const validPassword = await Usuario.verifyPassword(password, user.password);
        if (!validPassword) {
            return sendError(res, 'Credenciales inválidas', null, 401);
        }

        if (!user.email_verified) {
            return sendError(res, 'Por favor verifica tu email antes de iniciar sesión', { requires_verification: true }, 403);
        }

        const token = generarToken({
            id: user.id,
            email: user.email,
            role: user.role_name
        });

        sendSuccess(res, 'Login exitoso', {
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role_name,
                phone: user.phone,
                department: user.department
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        sendError(res, 'Error al iniciar sesión', null, 500);
    }
};

// Verificar email (2FA)
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return sendError(res, 'Token de verificación requerido');
        }

        const tokenData = await Token.findValid(token, 'email_verification');
        if (!tokenData) {
            return sendError(res, 'Token inválido o expirado');
        }

        await Usuario.verifyEmail(tokenData.user_id);
        await Token.markAsUsed(token);

        sendSuccess(res, 'Email verificado exitosamente');
    } catch (error) {
        console.error('Error en verificación de email:', error);
        sendError(res, 'Error al verificar email', null, 500);
    }
};

// Reenviar email de verificación
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await Usuario.findByEmail(email);
        if (!user) {
            return sendSuccess(res, 'Si el email existe, se enviará un nuevo enlace de verificación');
        }

        if (user.email_verified) {
            return sendError(res, 'El email ya está verificado');
        }

        await Token.deleteByUser(user.id, 'email_verification');
        const verificationToken = generarTokenVerificacion();
        await Token.create(user.id, verificationToken, 'email_verification', 24);

        try {
            await enviarEmailVerificacion(user.email, verificationToken, user.full_name);
        } catch (error) {
            console.error('Error al enviar email:', error);
            return sendError(res, 'Error al enviar email de verificación', null, 500);
        }

        sendSuccess(res, 'Email de verificación reenviado');
    } catch (error) {
        console.error('Error al reenviar verificación:', error);
        sendError(res, 'Error al reenviar email de verificación', null, 500);
    }
};

// Solicitar recuperación de contraseña
export const requestRecovery = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await Usuario.findByEmail(email);
        if (!user) {
            return sendSuccess(res, 'Si el email existe, se enviará un enlace de recuperación');
        }

        await Token.deleteByUser(user.id, 'password_recovery');
        const recoveryToken = generarTokenVerificacion();
        await Token.create(user.id, recoveryToken, 'password_recovery', 1);

        try {
            await enviarEmailRecuperacion(user.email, recoveryToken, user.full_name);
        } catch (error) {
            console.error('Error al enviar email:', error);
            return sendError(res, 'Error al enviar email de recuperación', null, 500);
        }

        sendSuccess(res, 'Si el email existe, se enviará un enlace de recuperación');
    } catch (error) {
        console.error('Error en solicitud de recuperación:', error);
        sendError(res, 'Error al procesar solicitud de recuperación', null, 500);
    }
};

// Restablecer contraseña
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token) {
            return sendError(res, 'Token de recuperación requerido');
        }

        const tokenData = await Token.findValid(token, 'password_recovery');
        if (!tokenData) {
            return sendError(res, 'Token inválido o expirado');
        }

        await Usuario.updatePassword(tokenData.user_id, password);
        await Token.markAsUsed(token);

        sendSuccess(res, 'Contraseña restablecida exitosamente');
    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        sendError(res, 'Error al restablecer contraseña', null, 500);
    }
};

// Obtener usuario actual
export const getCurrentUser = async (req, res) => {
    try {
        const user = await Usuario.findById(req.user.id);
        
        if (!user) {
            return sendError(res, 'Usuario no encontrado', null, 404);
        }

        sendSuccess(res, 'Usuario obtenido exitosamente', {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role_name,
            phone: user.phone,
            department: user.department,
            email_verified: user.email_verified
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        sendError(res, 'Error al obtener información del usuario', null, 500);
    }
};

