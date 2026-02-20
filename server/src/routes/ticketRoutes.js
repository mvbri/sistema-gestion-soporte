import express from 'express';
import {
    createTicket,
    getTickets,
    getTicketById,
    updateTicket,
    deleteTicket,
    addComment,
    getEstados,
    getCategorias,
    getPrioridades,
    getTecnicos,
    getStats,
    startProgress,
    markAsResolved
} from '../controllers/ticketController.js';
import {
    validateCreateTicket,
    validateUpdateTicket,
    validateComment
} from '../utils/validators.js';
import { authenticate } from '../utils/jwt.js';
import { upload } from '../config/upload.js';

const router = express.Router();

router.use(authenticate);

router.get('/estados', getEstados);
router.get('/categorias', getCategorias);
router.get('/prioridades', getPrioridades);
router.get('/tecnicos', getTecnicos);
router.get('/stats', getStats);

router.post('/', upload.array('imagenes', 5), validateCreateTicket, createTicket);
router.get('/', getTickets);
router.get('/:id', getTicketById);
router.put('/:id', validateUpdateTicket, updateTicket);
router.delete('/:id', deleteTicket);
router.post('/:id/comentarios', validateComment, addComment);
router.patch('/:id/iniciar-progreso', startProgress);
router.patch('/:id/marcar-resuelto', markAsResolved);

export default router;
