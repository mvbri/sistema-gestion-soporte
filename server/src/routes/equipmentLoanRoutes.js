import express from 'express';
import { authenticate } from '../utils/jwt.js';
import {
    approveEquipmentLoan,
    cancelEquipmentLoan,
    createEquipmentLoan,
    deliverEquipmentLoan,
    getAvailableEquipmentPools,
    getEquipmentLoanById,
    getEquipmentLoans,
    getEquipmentLoansSummaryReport,
    rejectEquipmentLoan,
    returnEquipmentLoan,
    updatePendingEquipmentLoanChecklist
} from '../controllers/equipmentLoanController.js';
import {
    validateApproveEquipmentLoan,
    validateCreateEquipmentLoan,
    validateDeliverEquipmentLoan,
    validateRejectEquipmentLoan,
    validateReturnEquipmentLoan,
    validateUpdatePendingLoanChecklist
} from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

router.get('/reports/summary', getEquipmentLoansSummaryReport);
router.get('/pools', getAvailableEquipmentPools);
router.post('/', validateCreateEquipmentLoan, createEquipmentLoan);
router.get('/', getEquipmentLoans);
router.get('/:id', getEquipmentLoanById);
router.patch('/:id/approve', validateApproveEquipmentLoan, approveEquipmentLoan);
router.patch('/:id/reject', validateRejectEquipmentLoan, rejectEquipmentLoan);
router.patch('/:id/deliver', validateDeliverEquipmentLoan, deliverEquipmentLoan);
router.patch('/:id/return', validateReturnEquipmentLoan, returnEquipmentLoan);
router.patch('/:id/pending-checklist', validateUpdatePendingLoanChecklist, updatePendingEquipmentLoanChecklist);
router.patch('/:id/cancel', cancelEquipmentLoan);

export default router;
