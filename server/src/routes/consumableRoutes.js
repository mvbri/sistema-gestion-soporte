import express from 'express';
import {
    createConsumable,
    getConsumables,
    getConsumableById,
    updateConsumable,
    deleteConsumable,
    getConsumableStats,
    getConsumableTypes,
    getConsumableStatuses
} from '../controllers/consumableController.js';
import {
    validateCreateConsumable,
    validateUpdateConsumable
} from '../utils/validators.js';
import { authenticate } from '../utils/jwt.js';

const router = express.Router();

router.use(authenticate);

router.get('/types', getConsumableTypes);
router.get('/statuses', getConsumableStatuses);
router.get('/stats', getConsumableStats);

router.post('/', validateCreateConsumable, createConsumable);
router.get('/', getConsumables);
router.get('/:id', getConsumableById);
router.put('/:id', validateUpdateConsumable, updateConsumable);
router.delete('/:id', deleteConsumable);

export default router;

