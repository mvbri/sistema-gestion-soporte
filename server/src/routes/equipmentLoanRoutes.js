import express from 'express';
import { authenticate } from '../utils/jwt.js';
import {
    addEquipmentLoanComment,
    approveEquipmentLoan,
    cancelEquipmentLoan,
    createEquipmentLoan,
    deliverEquipmentLoan,
    getEquipmentLoanById,
    getEquipmentLoanComments,
    getEquipmentLoans,
    getEquipmentLoansSummaryReport,
    rejectEquipmentLoan,
    returnEquipmentLoan,
    revokeEquipmentLoanApproval,
    updatePendingEquipmentLoanChecklist
} from '../controllers/equipmentLoanController.js';
import {
    validateApproveEquipmentLoan,
    validateCreateEquipmentLoan,
    validateDeliverEquipmentLoan,
    validateEquipmentLoanComment,
    validateRejectEquipmentLoan,
    validateReturnEquipmentLoan,
    validateRevokeEquipmentLoanApproval,
    validateUpdatePendingLoanChecklist
} from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

router.get('/reports/summary', getEquipmentLoansSummaryReport);
router.post('/', validateCreateEquipmentLoan, createEquipmentLoan);
router.get('/', getEquipmentLoans);
router.get('/:id/comments', getEquipmentLoanComments);
router.post('/:id/comments', validateEquipmentLoanComment, addEquipmentLoanComment);
router.patch('/:id/revoke-approval', validateRevokeEquipmentLoanApproval, revokeEquipmentLoanApproval);
router.get('/:id', getEquipmentLoanById);
router.patch('/:id/approve', validateApproveEquipmentLoan, approveEquipmentLoan);
router.patch('/:id/reject', validateRejectEquipmentLoan, rejectEquipmentLoan);
router.patch('/:id/deliver', validateDeliverEquipmentLoan, deliverEquipmentLoan);
router.patch('/:id/return', validateReturnEquipmentLoan, returnEquipmentLoan);
router.patch('/:id/pending-checklist', validateUpdatePendingLoanChecklist, updatePendingEquipmentLoanChecklist);
router.patch('/:id/cancel', cancelEquipmentLoan);

export default router;
