import express from 'express';
import { generateBackup, restoreBackup, listBackups, restoreBackupFromFile, downloadBackup, deleteBackup } from '../controllers/backupController.js';
import { authenticate } from '../utils/jwt.js';
import { uploadSqlBackup } from '../config/backup.js';

const router = express.Router();

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'administrator') {
        return res.status(403).json({
            success: false,
            message: 'Solo los administradores pueden acceder a esta funcionalidad'
        });
    }
    next();
};

router.use(authenticate);
router.use(isAdmin);

router.get('/list', listBackups);
router.get('/generate', generateBackup);
router.get('/download/:filename', downloadBackup);
router.delete('/delete/:filename', deleteBackup);
router.post('/restore', uploadSqlBackup.single('backupFile'), restoreBackup);
router.post('/restore-file', restoreBackupFromFile);

export default router;
