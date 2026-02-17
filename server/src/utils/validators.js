// Validaciones comunes usando express-validator
import { body, validationResult } from 'express-validator';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
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
        .normalizeEmail(),
    
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
    
    body('department')
        .trim()
        .notEmpty().withMessage('El departamento es requerido')
        .isIn(['IT', 'Direccion', 'Secretaria', 'otro']).withMessage('El departamento debe ser uno de los valores permitidos: IT, Direccion, Secretaria, otro'),
    
    handleValidationErrors
];

// Validaciones para login
export const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es requerido')
        .isEmail().withMessage('El email no es válido')
        .normalizeEmail(),
    
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
        .normalizeEmail(),
    
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
    
    body('department')
        .trim()
        .notEmpty().withMessage('El departamento es requerido')
        .isIn(['IT', 'Direccion', 'Secretaria', 'otro']).withMessage('El departamento debe ser uno de los valores permitidos: IT, Direccion, Secretaria, otro'),
    
    handleValidationErrors
];

// Validaciones para crear ticket (sin validar imagen_url si hay archivo)
export const validateCreateTicket = [
    body('titulo')
        .trim()
        .notEmpty().withMessage('El título es requerido')
        .isLength({ min: 5, max: 255 }).withMessage('El título debe tener entre 5 y 255 caracteres'),
    
    body('descripcion')
        .trim()
        .notEmpty().withMessage('La descripción es requerida')
        .isLength({ min: 20 }).withMessage('La descripción debe tener al menos 20 caracteres'),
    
    body('area_incidente')
        .trim()
        .notEmpty().withMessage('El área del incidente es requerida')
        .isLength({ max: 255 }).withMessage('El área del incidente no puede exceder 255 caracteres'),
    
    body('categoria_id')
        .notEmpty().withMessage('La categoría es requerida')
        .isInt({ min: 1 }).withMessage('La categoría debe ser un número válido'),
    
    body('prioridad_id')
        .notEmpty().withMessage('La prioridad es requerida')
        .isInt({ min: 1 }).withMessage('La prioridad debe ser un número válido'),
    
    handleValidationErrors
];

// Validaciones para actualizar ticket
export const validateUpdateTicket = [
    body('titulo')
        .optional()
        .trim()
        .isLength({ min: 5, max: 255 }).withMessage('El título debe tener entre 5 y 255 caracteres'),
    
    body('descripcion')
        .optional()
        .trim()
        .isLength({ min: 20 }).withMessage('La descripción debe tener al menos 20 caracteres'),
    
    body('area_incidente')
        .optional()
        .trim()
        .isLength({ max: 255 }).withMessage('El área del incidente no puede exceder 255 caracteres'),
    
    body('categoria_id')
        .optional()
        .isInt({ min: 1 }).withMessage('La categoría debe ser un número válido'),
    
    body('prioridad_id')
        .optional()
        .isInt({ min: 1 }).withMessage('La prioridad debe ser un número válido'),
    
    body('estado_id')
        .optional()
        .isInt({ min: 1 }).withMessage('El estado debe ser un número válido'),
    
    body('tecnico_asignado_id')
        .optional()
        .isInt({ min: 1 }).withMessage('El técnico asignado debe ser un número válido'),
    
    handleValidationErrors
];

// Validaciones para comentarios
export const validateComment = [
    body('contenido')
        .trim()
        .notEmpty().withMessage('El contenido del comentario es requerido')
        .isLength({ min: 5 }).withMessage('El comentario debe tener al menos 5 caracteres'),
    
    handleValidationErrors
];