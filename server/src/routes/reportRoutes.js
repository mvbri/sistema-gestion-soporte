import express from 'express';
import { authenticate } from '../utils/jwt.js';
import { getTicketsPeriodReport } from '../controllers/reportController.js';

const router = express.Router();

router.use(authenticate);
router.get('/tickets', getTicketsPeriodReport);

export default router;
