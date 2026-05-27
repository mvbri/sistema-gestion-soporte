import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { isCloudinaryUploadEnabled, uploadBufferToCloudinary } from '../lib/cloudinaryUpload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../../uploads/tickets');

if (!isCloudinaryUploadEnabled() && !fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WEBP)'));
    }
};

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `ticket-${uniqueSuffix}${ext}`);
    },
});

const storage = isCloudinaryUploadEnabled()
    ? multer.memoryStorage()
    : diskStorage;

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter,
});

export const uploadsDirPath = uploadsDir;

export async function cloudinaryUploadMiddleware(req, res, next) {
    if (!isCloudinaryUploadEnabled()) {
        return next();
    }

    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) {
        return next();
    }

    try {
        const urls = await Promise.all(
            files.map((file) => uploadBufferToCloudinary(file.buffer, file.originalname))
        );
        req.cloudinaryImageUrls = urls;
        next();
    } catch (error) {
        next(error);
    }
}
