import express from 'express';
import { authenticate } from '../utils/jwt.js';
import {
    addMaterialRequestComment,
    approveMaterialRequest,
    cancelMaterialRequest,
    createMaterialRequest,
    getMaterialRequestPdfData,
    getMaterialRequestById,
    getMaterialRequestComments,
    getMaterialRequests,
    rejectMaterialRequest
} from '../controllers/materialRequestController.js';
import {
    validateApproveMaterialRequest,
    validateCreateMaterialRequest,
    validateMaterialRequestComment,
    validateRejectMaterialRequest
} from '../utils/validators.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validateCreateMaterialRequest, createMaterialRequest);
router.get('/', getMaterialRequests);
router.get('/:id', getMaterialRequestById);
router.patch('/:id/approve', validateApproveMaterialRequest, approveMaterialRequest);
router.patch('/:id/reject', validateRejectMaterialRequest, rejectMaterialRequest);
router.patch('/:id/cancel', cancelMaterialRequest);
router.get('/:id/comments', getMaterialRequestComments);
router.post('/:id/comments', validateMaterialRequestComment, addMaterialRequestComment);
router.get('/:id/pdf', getMaterialRequestPdfData);

export default router;
