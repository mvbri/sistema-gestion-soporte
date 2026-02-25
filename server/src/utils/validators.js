// Validaciones comunes usando express-validator
import { body, validationResult } from 'express-validator';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            type: 'field',
            field: error.path,
            value: error.value || '',
            message: error.msg
        }));

        const errorMessages = formattedErrors.map(err => err.message);
        const mainMessage = formattedErrors.length === 1 
            ? formattedErrors[0].message 
            : `Se encontraron ${formattedErrors.length} errores de validación`;

        return res.status(400).json({
            success: false,
            message: mainMessage,
            errors: formattedErrors
        });
    }
    next();
};

export const validateRegistro = [
    body('full_name')
        .trim()
        .notEmpty().withMessage('El nombre completo es requerido')
        .isLength({ min: 3, max: 255 }).withMessage('El nombre debe tener entre 3 y 255 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('El email no es válido')
        .customSanitizer((value) => typeof value === 'string' ? value.toLowerCase() : value),
    
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    
    body('phone')
        .optional({ checkFalsy: true })
        .trim()
        .custom((value) => {
            if (!value || value === '') return true;
            if (!/^[0-9+\-\s()]+$/.test(value)) {
                throw new Error('El teléfono no es válido');
            }
            if (value.length < 10 || value.length > 20) {
                throw new Error('El teléfono debe tener entre 10 y 20 caracteres');
            }
            return true;
        }),
    
    body('incident_area_id')
        .notEmpty().withMessage('La dirección es requerida')
        .isInt({ min: 1 }).withMessage('La dirección seleccionada no es válida'),
    
    handleValidationErrors
];

// Validaciones para login
export const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('El email no es válido')
        .customSanitizer((value) => typeof value === 'string' ? value.toLowerCase() : value),
    
    body('password')
        .notEmpty().withMessage('La contraseña es requerida'),
    
    handleValidationErrors
];

// Validaciones para recuperación de contraseña
export const validateRecuperacionPassword = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('El email no es válido')
        .customSanitizer((value) => typeof value === 'string' ? value.toLowerCase() : value),
    
    handleValidationErrors
];

// Validaciones para restablecer contraseña
export const validateRestablecerPassword = [
    body('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    
    handleValidationErrors
];

export const validateUpdateProfile = [
    body('full_name')
        .trim()
        .notEmpty().withMessage('El nombre completo es requerido')
        .isLength({ min: 3, max: 255 }).withMessage('El nombre debe tener entre 3 y 255 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras y espacios'),
    
    body('phone')
        .optional({ checkFalsy: true })
        .trim()
        .custom((value) => {
            if (!value || value === '') return true;
            if (!/^[0-9+\-\s()]+$/.test(value)) {
                throw new Error('El teléfono no es válido');
            }
            if (value.length < 10 || value.length > 20) {
                throw new Error('El teléfono debe tener entre 10 y 20 caracteres');
            }
            return true;
        }),
    
    body('incident_area_id')
        .custom((value) => {
            if (value === undefined || value === null || value === '' || value === 0) {
                throw new Error('La dirección es requerida');
            }
            const numValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);
            if (isNaN(numValue) || numValue < 1) {
                throw new Error('La dirección seleccionada no es válida');
            }
            return true;
        })
        .toInt(),
    
    handleValidationErrors
];

// Validaciones para crear ticket (sin validar imagen_url si hay archivo)
export const validateCreateTicket = [
    body('title')
        .trim()
        .notEmpty().withMessage('Por favor, ingresa un título para el ticket')
        .isLength({ min: 5, max: 255 }).withMessage('El título debe tener entre 5 y 255 caracteres. Actualmente tiene menos de 5 caracteres'),
    
    body('description')
        .trim()
        .notEmpty().withMessage('Por favor, proporciona una descripción detallada del problema')
        .isLength({ min: 20 }).withMessage('La descripción debe tener al menos 20 caracteres para poder entender mejor el problema'),
    
    body('category_id')
        .notEmpty().withMessage('Debes seleccionar una categoría para el ticket')
        .isInt({ min: 1 }).withMessage('La categoría seleccionada no es válida'),
    
    body('priority_id')
        .notEmpty().withMessage('Debes seleccionar la prioridad del ticket')
        .isInt({ min: 1 }).withMessage('La prioridad seleccionada no es válida'),
    
    handleValidationErrors
];

// Validaciones para actualizar ticket
export const validateUpdateTicket = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 5, max: 255 }).withMessage('El título debe tener entre 5 y 255 caracteres'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ min: 20 }).withMessage('La descripción debe tener al menos 20 caracteres'),
    
    body('incident_area_id')
        .optional()
        .isInt({ min: 1 }).withMessage('La dirección debe ser un número válido'),
    
    body('category_id')
        .optional()
        .isInt({ min: 1 }).withMessage('La categoría debe ser un número válido'),
    
    body('priority_id')
        .optional()
        .isInt({ min: 1 }).withMessage('La prioridad debe ser un número válido'),
    
    body('state_id')
        .optional()
        .isInt({ min: 1 }).withMessage('El estado debe ser un número válido'),
    
    body('assigned_technician_id')
        .optional()
        .isInt({ min: 1 }).withMessage('El técnico asignado debe ser un número válido'),
    
    handleValidationErrors
];

// Validaciones para comentarios
export const validateComment = [
    body('content')
        .trim()
        .notEmpty().withMessage('Por favor, escribe un comentario antes de enviarlo')
        .isLength({ min: 5 }).withMessage('El comentario debe tener al menos 5 caracteres para ser válido'),
    
    handleValidationErrors
];

// Validaciones para obtener preguntas de seguridad
export const validateGetSecurityQuestions = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('El email no es válido')
        .customSanitizer((value) => typeof value === 'string' ? value.toLowerCase() : value),
    
    handleValidationErrors
];

// Validaciones para verificar respuestas de seguridad
export const validateVerifySecurityAnswers = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('El email no es válido')
        .customSanitizer((value) => typeof value === 'string' ? value.toLowerCase() : value),
    
    body('answer1')
        .trim()
        .notEmpty().withMessage('La primera respuesta es requerida')
        .isLength({ min: 3 }).withMessage('La respuesta debe tener al menos 3 caracteres'),
    
    body('answer2')
        .trim()
        .notEmpty().withMessage('La segunda respuesta es requerida')
        .isLength({ min: 3 }).withMessage('La respuesta debe tener al menos 3 caracteres'),
    
    handleValidationErrors
];

// Validaciones para configurar preguntas de seguridad
export const validateSetSecurityQuestions = [
    body('question1')
        .trim()
        .notEmpty().withMessage('La primera pregunta es requerida')
        .isLength({ min: 10 }).withMessage('La pregunta debe tener al menos 10 caracteres'),
    
    body('answer1')
        .trim()
        .notEmpty().withMessage('La primera respuesta es requerida')
        .isLength({ min: 3 }).withMessage('La respuesta debe tener al menos 3 caracteres'),
    
    body('question2')
        .trim()
        .notEmpty().withMessage('La segunda pregunta es requerida')
        .isLength({ min: 10 }).withMessage('La pregunta debe tener al menos 10 caracteres'),
    
    body('answer2')
        .trim()
        .notEmpty().withMessage('La segunda respuesta es requerida')
        .isLength({ min: 3 }).withMessage('La respuesta debe tener al menos 3 caracteres'),
    
    handleValidationErrors
];

// Validaciones para crear equipo
export const validateCreateEquipment = [
    body('name')
        .trim()
        .notEmpty().withMessage('El nombre del equipo es requerido')
        .isLength({ min: 3, max: 255 }).withMessage('El nombre debe tener entre 3 y 255 caracteres'),
    
    body('brand')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 }).withMessage('La marca no puede exceder 100 caracteres'),
    
    body('model')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 }).withMessage('El modelo no puede exceder 100 caracteres'),
    
    body('serial_number')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 }).withMessage('El número de serie no puede exceder 100 caracteres'),
    
    body('type')
        .optional()
        .isIn(['laptop', 'desktop', 'monitor', 'printer', 'network_device', 'other'])
        .withMessage('El tipo de equipo no es válido'),
    
    body('status')
        .optional()
        .isIn(['available', 'assigned', 'maintenance', 'retired'])
        .withMessage('El estado del equipo no es válido'),
    
    body('location')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 255 }).withMessage('La ubicación no puede exceder 255 caracteres'),
    
    body('assigned_to_user_id')
        .optional()
        .isInt({ min: 1 }).withMessage('El ID del usuario asignado debe ser un número válido'),
    
    body('description')
        .optional({ checkFalsy: true })
        .trim(),
    
    body('purchase_date')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('La fecha de compra debe ser una fecha válida'),
    
    body('warranty_expires_at')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('La fecha de expiración de garantía debe ser una fecha válida'),
    
    handleValidationErrors
];

// Validaciones para actualizar equipo
export const validateUpdateEquipment = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 255 }).withMessage('El nombre debe tener entre 3 y 255 caracteres'),
    
    body('brand')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 }).withMessage('La marca no puede exceder 100 caracteres'),
    
    body('model')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 }).withMessage('El modelo no puede exceder 100 caracteres'),
    
    body('serial_number')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 }).withMessage('El número de serie no puede exceder 100 caracteres'),
    
    body('type')
        .optional()
        .isIn(['laptop', 'desktop', 'monitor', 'printer', 'network_device', 'other'])
        .withMessage('El tipo de equipo no es válido'),
    
    body('status')
        .optional()
        .isIn(['available', 'assigned', 'maintenance', 'retired'])
        .withMessage('El estado del equipo no es válido'),
    
    body('location')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 255 }).withMessage('La ubicación no puede exceder 255 caracteres'),
    
    body('assigned_to_user_id')
        .optional()
        .custom((value) => {
            if (value === null || value === undefined || value === '') return true;
            return Number.isInteger(Number(value)) && Number(value) >= 1;
        })
        .withMessage('El ID del usuario asignado debe ser un número válido o null'),
    
    body('description')
        .optional({ checkFalsy: true })
        .trim(),
    
    body('purchase_date')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('La fecha de compra debe ser una fecha válida'),
    
    body('warranty_expires_at')
        .optional({ checkFalsy: true })
        .isISO8601().withMessage('La fecha de expiración de garantía debe ser una fecha válida'),
    
    handleValidationErrors
];

// Validaciones para asignar equipo
export const validateAssignEquipment = [
    body('user_id')
        .notEmpty().withMessage('El ID del usuario es requerido')
        .isInt({ min: 1 }).withMessage('El ID del usuario debe ser un número válido'),
    
    handleValidationErrors
];