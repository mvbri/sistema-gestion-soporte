import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio base para almacenar respaldos (no público)
const backupsBaseDir = path.join(__dirname, '../../backups');

if (!fs.existsSync(backupsBaseDir)) {
  fs.mkdirSync(backupsBaseDir, { recursive: true });
}

// Multer para subir archivos .sql de respaldo
const sqlStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, backupsBaseDir);
  },
  filename: (req, file, cb) => {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-');
    cb(null, `restore_${timestamp}.sql`);
  },
});

const sqlFileFilter = (req, file, cb) => {
  const isSql =
    file.mimetype === 'application/sql' ||
    file.mimetype === 'text/plain' ||
    file.originalname.toLowerCase().endsWith('.sql');

  if (isSql) {
    return cb(null, true);
  }

  cb(new Error('Solo se permiten archivos de respaldo .sql'));
};

export const uploadSqlBackup = multer({
  storage: sqlStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: sqlFileFilter,
});

export const backupsDirPath = backupsBaseDir;

