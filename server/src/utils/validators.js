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
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 100 }).withMessage('El departamento no puede exceder 100 caracteres'),
    
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
