import express from 'express';
import {
    register as registerController,
    login,
    verifyEmail,
    resendVerification,
    requestRecovery,
    resetPassword,
    getCurrentUser,
    updateCurrentUser,
    getSecurityQuestions,
    verifySecurityAnswers,
    setSecurityQuestions,
    getDireccionesPublic
} from '../controllers/authController.js';
import {
    validateRegistro,
    validateLogin,
    validateRecuperacionPassword,
    validateRestablecerPassword,
    validateUpdateProfile,
    validateGetSecurityQuestions,
    validateVerifySecurityAnswers,
    validateSetSecurityQuestions
} from '../utils/validators.js';
import { authenticate } from '../utils/jwt.js';

const router = express.Router();

router.post('/register', validateRegistro, registerController);
router.post('/login', validateLogin, login);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', validateRecuperacionPassword, resendVerification);
router.post('/request-password-recovery', validateRecuperacionPassword, requestRecovery);
router.post('/reset-password', validateRestablecerPassword, resetPassword);

router.post('/get-security-questions', validateGetSecurityQuestions, getSecurityQuestions);
router.post('/verify-security-answers', validateVerifySecurityAnswers, verifySecurityAnswers);

// Direcciones públicas para formularios de registro
router.get('/direcciones', getDireccionesPublic);

router.get('/current-user', authenticate, getCurrentUser);
router.put('/profile', authenticate, validateUpdateProfile, updateCurrentUser);
router.put('/security-questions', authenticate, validateSetSecurityQuestions, setSecurityQuestions);

export default router;

