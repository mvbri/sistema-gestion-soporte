import express from 'express';
import {
    getCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    getPrioridades,
    createPrioridad,
    updatePrioridad,
    deletePrioridad,
    getDirecciones,
    createDireccion,
    updateDireccion,
    deleteDireccion,
    getEquipmentTypes,
    createEquipmentType,
    updateEquipmentType,
    deleteEquipmentType,
    getConsumableTypesAdmin,
    createConsumableType,
    updateConsumableType,
    deleteConsumableType,
    getUsers,
    createUser,
    updateUserStatus,
    updateUser,
    verifyUserEmail,
    deleteUser
} from '../controllers/adminController.js';
import { authenticate } from '../utils/jwt.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../utils/validators.js';
import backupRoutes from './backupRoutes.js';

const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'administrator') {
        return res.status(403).json({
            success: false,
            message: 'Solo los administradores pueden acceder a esta funcionalidad'
        });
    }
    next();
};

router.use(authenticate);
router.use(isAdmin);

router.get('/categorias', getCategorias);
router.post('/categorias', [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('description').optional().trim(),
    handleValidationErrors
], createCategoria);
router.put('/categorias/:id', [
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('description').optional().trim(),
    body('active').optional().isBoolean(),
    handleValidationErrors
], updateCategoria);
router.delete('/categorias/:id', deleteCategoria);

router.get('/prioridades', getPrioridades);
router.post('/prioridades', [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('level').isInt({ min: 1 }).withMessage('El nivel debe ser un número entero mayor a 0'),
    body('color').trim().notEmpty().withMessage('El color es requerido'),
    body('description').optional().trim(),
    handleValidationErrors
], createPrioridad);
router.put('/prioridades/:id', [
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('level').optional().isInt({ min: 1 }).withMessage('El nivel debe ser un número entero mayor a 0'),
    body('color').optional().trim().notEmpty().withMessage('El color no puede estar vacío'),
    body('description').optional().trim(),
    body('active').optional().isBoolean(),
    handleValidationErrors
], updatePrioridad);
router.delete('/prioridades/:id', deletePrioridad);

router.get('/direcciones', getDirecciones);
router.post('/direcciones', [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('description').optional().trim(),
    handleValidationErrors
], createDireccion);
router.put('/direcciones/:id', [
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('description').optional().trim(),
    body('active').optional().isBoolean(),
    handleValidationErrors
], updateDireccion);
router.delete('/direcciones/:id', deleteDireccion);

router.get('/equipment-types', getEquipmentTypes);
router.post('/equipment-types', [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('description').optional().trim(),
    handleValidationErrors
], createEquipmentType);
router.put('/equipment-types/:id', [
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('description').optional().trim(),
    body('active').optional().isBoolean(),
    handleValidationErrors
], updateEquipmentType);
router.delete('/equipment-types/:id', deleteEquipmentType);

router.get('/consumable-types', getConsumableTypesAdmin);
router.post('/consumable-types', [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('description').optional().trim(),
    handleValidationErrors
], createConsumableType);
router.put('/consumable-types/:id', [
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('description').optional().trim(),
    body('active').optional().isBoolean(),
    handleValidationErrors
], updateConsumableType);
router.delete('/consumable-types/:id', deleteConsumableType);

router.get('/users', getUsers);
router.post('/users', [
    body('full_name').trim().notEmpty().withMessage('El nombre completo es requerido'),
    body('email').trim().isEmail().withMessage('El email debe ser válido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    body('phone').optional().trim(),
    body('incident_area_id').optional().isInt().withMessage('El ID de dirección debe ser un número entero'),
    body('role_id').optional().isInt({ min: 1, max: 3 }).withMessage('El ID de rol debe ser entre 1 y 3'),
    body('active').optional().isBoolean().withMessage('El campo active debe ser un booleano'),
    handleValidationErrors
], createUser);
router.patch('/users/:id/status', [
    body('active').isBoolean().withMessage('El campo active es requerido y debe ser un booleano'),
    handleValidationErrors
], updateUserStatus);
router.patch('/users/:id/verify-email', verifyUserEmail);
router.put('/users/:id', [
    body('full_name').optional().trim().notEmpty().withMessage('El nombre completo no puede estar vacío'),
    body('email').optional().trim().isEmail().withMessage('El email debe ser válido'),
    body('password').optional().isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    body('phone').optional().trim(),
    body('incident_area_id').optional().isInt().withMessage('El ID de dirección debe ser un número entero'),
    body('role_id').optional().isInt({ min: 1, max: 3 }).withMessage('El ID de rol debe ser entre 1 y 3'),
    body('active').optional().isBoolean().withMessage('El campo active debe ser un booleano'),
    handleValidationErrors
], updateUser);
router.delete('/users/:id', deleteUser);

router.use('/backup', backupRoutes);

export default router;
