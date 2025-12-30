import express from 'express';
import {
    register,
    login,
    verifyEmail,
    resendVerification,
    requestRecovery,
    resetPassword,
    getCurrentUser
} from '../controllers/authController.js';
import {
    validateRegistro,
    validateLogin,
    validateRecuperacionPassword,
    validateRestablecerPassword
} from '../utils/validators.js';
import { authenticate } from '../utils/jwt.js';

const router = express.Router();

router.post('/register', validateRegistro, register);
router.post('/login', validateLogin, login);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', validateRecuperacionPassword, resendVerification);
router.post('/request-password-recovery', validateRecuperacionPassword, requestRecovery);
router.post('/reset-password', validateRestablecerPassword, resetPassword);

router.get('/current-user', authenticate, getCurrentUser);

export default router;

