import express from 'express';
import {
    getCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    getPrioridades,
    createPrioridad,
    updatePrioridad,
    deletePrioridad
} from '../controllers/adminController.js';
import { authenticate } from '../utils/jwt.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../utils/validators.js';

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
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
    body('descripcion').optional().trim(),
    handleValidationErrors
], createCategoria);
router.put('/categorias/:id', [
    body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('descripcion').optional().trim(),
    body('activo').optional().isBoolean(),
    handleValidationErrors
], updateCategoria);
router.delete('/categorias/:id', deleteCategoria);

router.get('/prioridades', getPrioridades);
router.post('/prioridades', [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
    body('nivel').isInt({ min: 1 }).withMessage('El nivel debe ser un número entero mayor a 0'),
    body('color').trim().notEmpty().withMessage('El color es requerido'),
    body('descripcion').optional().trim(),
    handleValidationErrors
], createPrioridad);
router.put('/prioridades/:id', [
    body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('nivel').optional().isInt({ min: 1 }).withMessage('El nivel debe ser un número entero mayor a 0'),
    body('color').optional().trim().notEmpty().withMessage('El color no puede estar vacío'),
    body('descripcion').optional().trim(),
    body('activo').optional().isBoolean(),
    handleValidationErrors
], updatePrioridad);
router.delete('/prioridades/:id', deletePrioridad);

export default router;
