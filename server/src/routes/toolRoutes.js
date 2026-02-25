import express from 'express';
import {
    createTool,
    getTools,
    getToolById,
    updateTool,
    deleteTool,
    assignTool,
    unassignTool,
    getToolStats,
    getToolTypes,
    getToolStatuses
} from '../controllers/toolController.js';
import {
    validateCreateTool,
    validateUpdateTool,
    validateAssignTool
} from '../utils/validators.js';
import { authenticate } from '../utils/jwt.js';

const router = express.Router();

router.use(authenticate);

router.get('/types', getToolTypes);
router.get('/statuses', getToolStatuses);
router.get('/stats', getToolStats);

router.post('/', validateCreateTool, createTool);
router.get('/', getTools);
router.get('/:id', getToolById);
router.put('/:id', validateUpdateTool, updateTool);
router.delete('/:id', deleteTool);
router.patch('/:id/assign', validateAssignTool, assignTool);
router.patch('/:id/unassign', unassignTool);

export default router;

