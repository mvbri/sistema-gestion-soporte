// Controlador de autenticación
import Usuario from '../models/Usuario.js';
import Token from '../models/Token.js';
import { generarToken } from '../utils/jwt.js';
import { generarTokenVerificacion } from '../utils/crypto.js';
import { enviarEmailVerificacion, enviarEmailRecuperacion } from '../config/email.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { query } from '../config/database.js';

// Registro de nuevo usuario
export const register = async (req, res) => {
    let userId = null;
    let tokenCreated = false;
    let emailSent = false;

    try {
        const { full_name, email, password, phone, incident_area_id } = req.body;

        const emailExists = await Usuario.emailExists(email);
        if (emailExists) {
            return sendError(res, 'El email ya está registrado');
        }

        const user = await Usuario.create({
            full_name,
            email,
            password,
            phone,
            incident_area_id: incident_area_id ? Number(incident_area_id) : null
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

        if (!email || !password) {
            return sendError(res, 'Email y contraseña son requeridos', null, 400);
        }

        console.log('🔍 Intentando login con email:', email);
        const user = await Usuario.findByEmail(email);
        if (!user) {
            console.log('❌ Usuario no encontrado para email:', email);
            return sendError(res, 'Credenciales inválidas', null, 401);
        }

        console.log('✅ Usuario encontrado - ID:', user.id, 'Email:', user.email, 'Email verificado:', user.email_verified, 'Activo:', user.active);

        const validPassword = await Usuario.verifyPassword(password, user.password);
        if (!validPassword) {
            return sendError(res, 'Credenciales inválidas', null, 401);
        }

        if (!user.email_verified) {
            console.log('❌ Email no verificado para usuario ID:', user.id, 'Email:', user.email);
            if (!user.active) {
                return sendError(res, 'Tu cuenta está desactivada. Contacta al administrador.', null, 401);
            }
            return sendError(res, 'Por favor verifica tu email antes de iniciar sesión', { requires_verification: true }, 403);
        }

        if (!user.active) {
            console.log('❌ Usuario verificado pero inactivo - ID:', user.id, 'Email:', user.email);
            return sendError(res, 'Tu cuenta está verificada pero inactiva. Contacta al administrador para activar tu cuenta.', null, 401);
        }

        if (!user.role_name) {
            console.error('Usuario sin role_name:', user);
            return sendError(res, 'Error en la configuración del usuario. Contacta al administrador.', null, 500);
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
                department: user.department,
                incident_area_id: user.incident_area_id || null
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        console.error('Stack trace:', error.stack);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
        
        // Mensaje de error más específico
        let errorMessage = 'Error al iniciar sesión';
        if (error.code === 'ER_NO_SUCH_TABLE') {
            errorMessage = 'Error en la base de datos. La tabla requerida no existe.';
        } else if (error.code === 'ER_BAD_FIELD_ERROR') {
            errorMessage = 'Error en la base de datos. Columna no encontrada.';
        } else if (error.message && error.message.includes('ECONNREFUSED')) {
            errorMessage = 'Error de conexión con la base de datos.';
        }
        
        sendError(res, errorMessage, null, 500);
    }
};

// Verificar email (2FA)
export const verifyEmail = async (req, res) => {
    try {
        let { token } = req.query;

        if (!token) {
            return sendError(res, 'Token de verificación requerido');
        }

        // Decodificar token en caso de que esté codificado en la URL
        try {
            token = decodeURIComponent(token);
        } catch (e) {
            console.warn('Error al decodificar token, usando token original:', e.message);
        }

        console.log('🔍 Verificando token:', token.substring(0, 10) + '...');

        // Verificar si el token existe (incluso si está expirado o usado)
        const tokenData = await Token.findValid(token, 'email_verification');
        
        if (!tokenData) {
            // Intentar encontrar el token sin validar para dar un mensaje más específico
            const sql = `
                SELECT t.id, t.user_id, t.token, t.type, t.expires_at, t.used, t.created_at,
                       u.email, u.full_name, u.email_verified
                FROM verification_tokens t
                JOIN users u ON t.user_id = u.id
                WHERE t.token = ? AND t.type = ?
            `;
            const result = await query(sql, [token, 'email_verification']);
            
            if (result[0]) {
                const tokenInfo = result[0];
                
                // Si el email ya está verificado, no importa el estado del token
                if (tokenInfo.email_verified) {
                    console.log('ℹ️ Email ya está verificado para usuario ID:', tokenInfo.user_id);
                    return sendSuccess(res, 'Tu email ya está verificado', { already_verified: true });
                }
                
                // Si el token ya fue usado pero el email NO está verificado
                if (tokenInfo.used) {
                    console.log('❌ Token ya fue usado y email no verificado');
                    return sendError(res, 'Este token ya fue utilizado. Solicita un nuevo enlace de verificación.');
                }
                
                // Si el token está expirado y el email NO está verificado
                if (new Date(tokenInfo.expires_at) < new Date()) {
                    console.log('❌ Token expirado y email no verificado');
                    return sendError(res, 'El token ha expirado. Solicita un nuevo enlace de verificación.');
                }
            }
            
            console.log('❌ Token no encontrado');
            return sendError(res, 'Token inválido o expirado');
        }

        // Verificar si el email ya está verificado
        if (tokenData.email_verified) {
            console.log('ℹ️ Email ya está verificado para usuario ID:', tokenData.user_id);
            await Token.markAsUsed(token);
            return sendSuccess(res, 'Email ya estaba verificado', { already_verified: true });
        }

        console.log('✅ Token válido para usuario ID:', tokenData.user_id);
        await Usuario.verifyEmail(tokenData.user_id);
        await Token.markAsUsed(token);
        console.log('✅ Email verificado exitosamente para usuario ID:', tokenData.user_id);

        sendSuccess(res, 'Email verificado exitosamente');
    } catch (error) {
        console.error('❌ Error en verificación de email:', error);
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

        if (!email) {
            return sendError(res, 'Email requerido');
        }

        const user = await Usuario.findByEmail(email);
        if (!user) {
            return sendSuccess(res, 'Si el email existe, se enviará un enlace de recuperación');
        }

        try {
            await Token.deleteByUser(user.id, 'password_recovery');
        } catch (error) {
            console.error('Error al eliminar tokens anteriores:', error);
        }

        const recoveryToken = generarTokenVerificacion();
        
        try {
            await Token.create(user.id, recoveryToken, 'password_recovery', 1);
        } catch (error) {
            console.error('Error al crear token de recuperación:', error);
            return sendError(res, 'Error al generar token de recuperación', null, 500);
        }

        try {
            await enviarEmailRecuperacion(user.email, recoveryToken, user.full_name);
        } catch (error) {
            console.error('Error al enviar email de recuperación:', error);
            console.error('Detalles del error:', {
                message: error.message,
                code: error.code,
                response: error.response
            });
            
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                return sendError(res, 'Configuración de email incompleta. Por favor contacta al administrador.', null, 500);
            }
            
            if (!process.env.FRONTEND_URL) {
                return sendError(res, 'URL del frontend no configurada. Por favor contacta al administrador.', null, 500);
            }
            
            return sendError(res, 'Error al enviar email de recuperación. Por favor intenta más tarde.', null, 500);
        }

        sendSuccess(res, 'Si el email existe, se enviará un enlace de recuperación');
    } catch (error) {
        console.error('Error en solicitud de recuperación:', error);
        console.error('Stack trace:', error.stack);
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

/**
 * Obtener preguntas de seguridad de un usuario por email
 */
export const getSecurityQuestions = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return sendError(res, 'Email requerido');
        }

        const user = await Usuario.findByEmail(email);
        if (!user) {
            return sendError(res, 'No se encontró un usuario con ese email');
        }

        const questions = await Usuario.getSecurityQuestions(email);
        
        if (!questions) {
            return sendError(res, 'El usuario no tiene preguntas de seguridad configuradas');
        }

        sendSuccess(res, 'Preguntas de seguridad obtenidas', questions);
    } catch (error) {
        console.error('Error al obtener preguntas de seguridad:', error);
        console.error('Stack trace:', error.stack);
        
        if (error.code === 'ER_BAD_FIELD_ERROR' || (error.message && error.message.includes('Unknown column'))) {
            return sendError(res, 'Las columnas de preguntas de seguridad no existen en la base de datos. Por favor ejecuta la migración correspondiente.', null, 500);
        }
        
        sendError(res, 'Error al obtener preguntas de seguridad', null, 500);
    }
};

/**
 * Verificar respuestas de seguridad y generar token de recuperación
 */
export const verifySecurityAnswers = async (req, res) => {
    try {
        const { email, answer1, answer2 } = req.body;

        if (!email || !answer1 || !answer2) {
            return sendError(res, 'Email y ambas respuestas son requeridas');
        }

        const user = await Usuario.findByEmail(email);
        if (!user) {
            return sendError(res, 'Usuario no encontrado', null, 404);
        }

        const isValid = await Usuario.verifySecurityAnswers(user.id, { answer1, answer2 });
        
        if (!isValid) {
            return sendError(res, 'Las respuestas de seguridad son incorrectas', null, 401);
        }

        await Token.deleteByUser(user.id, 'password_recovery');
        const recoveryToken = generarTokenVerificacion();
        await Token.create(user.id, recoveryToken, 'password_recovery', 1);

        sendSuccess(res, 'Respuestas verificadas correctamente', { token: recoveryToken });
    } catch (error) {
        console.error('Error al verificar respuestas de seguridad:', error);
        sendError(res, 'Error al verificar respuestas de seguridad', null, 500);
    }
};

/**
 * Configurar preguntas de seguridad (requiere autenticación)
 */
export const setSecurityQuestions = async (req, res) => {
    try {
        const { question1, answer1, question2, answer2 } = req.body;

        if (!question1 || !answer1 || !question2 || !answer2) {
            return sendError(res, 'Todas las preguntas y respuestas son requeridas');
        }

        if (question1.trim().length < 10 || question2.trim().length < 10) {
            return sendError(res, 'Las preguntas deben tener al menos 10 caracteres');
        }

        if (answer1.trim().length < 3 || answer2.trim().length < 3) {
            return sendError(res, 'Las respuestas deben tener al menos 3 caracteres');
        }

        await Usuario.updateSecurityQuestions(req.user.id, {
            question1: question1.trim(),
            answer1: answer1.trim(),
            question2: question2.trim(),
            answer2: answer2.trim()
        });

        sendSuccess(res, 'Preguntas de seguridad configuradas exitosamente');
    } catch (error) {
        console.error('Error al configurar preguntas de seguridad:', error);
        console.error('Detalles del error:', error.message);
        console.error('Código del error:', error.code);
        
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            return sendError(res, 'Las columnas de preguntas de seguridad no existen en la base de datos. Por favor ejecuta la migración migration_security_questions.sql', null, 500);
        }
        
        const errorMessage = error.message || 'Error al configurar preguntas de seguridad';
        sendError(res, errorMessage, null, 500);
    }
};

/**
 * Configurar preguntas de seguridad durante el registro (público, usando email)
 * Solo permite configurar si el usuario no tiene preguntas configuradas aún
 */
export const setSecurityQuestionsPublic = async (req, res) => {
    try {
        const { email, question1, answer1, question2, answer2 } = req.body;

        if (!email || !question1 || !answer1 || !question2 || !answer2) {
            return sendError(res, 'Email y todas las preguntas y respuestas son requeridas');
        }

        if (question1.trim().length < 10 || question2.trim().length < 10) {
            return sendError(res, 'Las preguntas deben tener al menos 10 caracteres');
        }

        if (answer1.trim().length < 3 || answer2.trim().length < 3) {
            return sendError(res, 'Las respuestas deben tener al menos 3 caracteres');
        }

        const user = await Usuario.findByEmail(email);
        if (!user) {
            return sendError(res, 'Usuario no encontrado');
        }

        // Solo permitir si el usuario no tiene preguntas configuradas aún
        if (user.security_question_1 || user.security_question_2) {
            return sendError(res, 'Las preguntas de seguridad ya están configuradas. Usa el perfil para actualizarlas.');
        }

        await Usuario.updateSecurityQuestions(user.id, {
            question1: question1.trim(),
            answer1: answer1.trim(),
            question2: question2.trim(),
            answer2: answer2.trim()
        });

        sendSuccess(res, 'Preguntas de seguridad configuradas exitosamente');
    } catch (error) {
        console.error('Error al configurar preguntas de seguridad (público):', error);
        console.error('Detalles del error:', error.message);
        console.error('Código del error:', error.code);
        
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            return sendError(res, 'Las columnas de preguntas de seguridad no existen en la base de datos. Por favor ejecuta la migración migration_security_questions.sql', null, 500);
        }
        
        const errorMessage = error.message || 'Error al configurar preguntas de seguridad';
        sendError(res, errorMessage, null, 500);
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
            incident_area_id: user.incident_area_id || null,
            email_verified: user.email_verified
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        sendError(res, 'Error al obtener información del usuario', null, 500);
    }
};

/**
 * Actualizar perfil del usuario autenticado
 */
export const updateCurrentUser = async (req, res) => {
    try {
        const { full_name, phone, incident_area_id } = req.body;

        console.log('=== INICIO ACTUALIZACIÓN PERFIL ===');
        console.log('Usuario ID:', req.user.id);
        console.log('Datos recibidos completos:', JSON.stringify(req.body, null, 2));
        console.log('full_name:', full_name, 'tipo:', typeof full_name);
        console.log('phone:', phone, 'tipo:', typeof phone);
        console.log('incident_area_id:', incident_area_id, 'tipo:', typeof incident_area_id);

        if (!full_name || typeof full_name !== 'string' || full_name.trim().length === 0) {
            return sendError(res, 'El nombre completo es requerido', null, 400);
        }

        let parsedIncidentAreaId = null;
        if (incident_area_id !== undefined && incident_area_id !== null && incident_area_id !== '' && incident_area_id !== 0) {
            if (typeof incident_area_id === 'string' && !isNaN(parseInt(incident_area_id)) && parseInt(incident_area_id) > 0) {
                parsedIncidentAreaId = parseInt(incident_area_id);
            } else if (typeof incident_area_id === 'number' && incident_area_id > 0) {
                parsedIncidentAreaId = incident_area_id;
            } else {
                console.warn('incident_area_id no es un número válido:', incident_area_id);
                return sendError(res, 'La dirección seleccionada no es válida', null, 400);
            }
        } else {
            return sendError(res, 'La dirección es requerida', null, 400);
        }

        console.log('incident_area_id parseado:', parsedIncidentAreaId);

        // Verificar que la dirección existe antes de actualizar
        try {
            let direccionCheck;
            try {
                direccionCheck = await query(
                    'SELECT id FROM incident_areas WHERE id = ?',
                    [parsedIncidentAreaId]
                );
            } catch (error) {
                if (error.code === 'ER_NO_SUCH_TABLE') {
                    return sendError(res, 'Error en la estructura de la base de datos. La tabla de direcciones no existe.', null, 500);
                }
                throw error;
            }
            
            if (!direccionCheck || direccionCheck.length === 0) {
                return sendError(res, 'La dirección seleccionada no existe', null, 400);
            }
        } catch (error) {
            console.error('Error al verificar dirección:', error);
            return sendError(res, 'Error al verificar la dirección seleccionada', null, 500);
        }

        const updatedUser = await Usuario.updateProfile(req.user.id, {
            full_name: full_name.trim(),
            phone: phone ? phone.trim() : null,
            incident_area_id: parsedIncidentAreaId
        });

        if (!updatedUser) {
            return sendError(res, 'Usuario no encontrado después de la actualización', null, 404);
        }

        sendSuccess(res, 'Perfil actualizado exitosamente', {
            id: updatedUser.id,
            full_name: updatedUser.full_name,
            email: updatedUser.email,
            role: updatedUser.role_name,
            phone: updatedUser.phone,
            department: updatedUser.department,
            incident_area_id: updatedUser.incident_area_id || null,
            email_verified: updatedUser.email_verified
        });
    } catch (error) {
        console.error('=== ERROR AL ACTUALIZAR PERFIL ===');
        console.error('Error completo:', error);
        console.error('Stack trace:', error.stack);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error SQL State:', error.sqlState);
        console.error('Error SQL Message:', error.sqlMessage);
        
        let errorMessage = 'Error al actualizar perfil de usuario';
        if (error.code === 'ER_NO_SUCH_TABLE') {
            errorMessage = 'Error en la estructura de la base de datos. La tabla requerida no existe.';
        } else if (error.code === 'ER_BAD_FIELD_ERROR') {
            errorMessage = 'Error en la estructura de la base de datos. Verifica las migraciones.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        console.error('Mensaje de error que se enviará al cliente:', errorMessage);
        sendError(res, errorMessage, null, 500);
    }
};

/**
 * Obtener direcciones (áreas de incidente) públicas para formularios de registro
 */
export const getDireccionesPublic = async (req, res) => {
    try {
        let sql = 'SELECT * FROM incident_areas WHERE active = TRUE ORDER BY name';
        try {
            const direcciones = await query(sql);
            sendSuccess(res, 'Direcciones obtenidas exitosamente', direcciones);
        } catch (error) {
            if (error.code === 'ER_BAD_FIELD_ERROR') {
                sql = 'SELECT * FROM incident_areas WHERE activo = TRUE ORDER BY nombre';
                const direcciones = await query(sql);
                sendSuccess(res, 'Direcciones obtenidas exitosamente', direcciones);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('Error al obtener direcciones públicas:', error);
        sendError(res, 'Error al obtener direcciones', null, 500);
    }
};
