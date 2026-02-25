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
    deleteConsumableType
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

router.use('/backup', backupRoutes);

export default router;
