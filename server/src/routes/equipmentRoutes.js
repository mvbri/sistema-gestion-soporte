import express from 'express';
import {
    createEquipment,
    getEquipment,
    getEquipmentById,
    updateEquipment,
    deleteEquipment,
    assignEquipment,
    unassignEquipment,
    getEquipmentStats,
    getEquipmentTypes,
    getEquipmentStatuses
} from '../controllers/equipmentController.js';
import {
    validateCreateEquipment,
    validateUpdateEquipment,
    validateAssignEquipment
} from '../utils/validators.js';
import { authenticate } from '../utils/jwt.js';

const router = express.Router();

router.use(authenticate);

router.get('/types', getEquipmentTypes);
router.get('/statuses', getEquipmentStatuses);
router.get('/stats', getEquipmentStats);

router.post('/', validateCreateEquipment, createEquipment);
router.get('/', getEquipment);
router.get('/:id', getEquipmentById);
router.put('/:id', validateUpdateEquipment, updateEquipment);
router.delete('/:id', deleteEquipment);
router.patch('/:id/assign', validateAssignEquipment, assignEquipment);
router.patch('/:id/unassign', unassignEquipment);

export default router;
