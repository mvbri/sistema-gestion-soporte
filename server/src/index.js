// Servidor principal
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes subidas)
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Servimos tanto /uploads (acceso directo) como /api/uploads (cuando se usa baseURL /api en el frontend)
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));
app.use('/api/uploads', express.static(uploadsPath));

// Crear directorio de backups si no existe
const backupsPath = path.join(__dirname, '../backups');
if (!fs.existsSync(backupsPath)) {
    fs.mkdirSync(backupsPath, { recursive: true });
}

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/equipment', equipmentRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Servidor funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Error: El puerto ${PORT} ya está en uso.`);
        console.error(`💡 Soluciones:`);
        console.error(`   1. Cierra la otra instancia del servidor que está usando el puerto ${PORT}`);
        console.error(`   2. O cambia el puerto en el archivo .env (PORT=5001)`);
        console.error(`   3. O mata el proceso: netstat -ano | findstr :${PORT} y luego taskkill /PID <PID> /F\n`);
        process.exit(1);
    } else {
        console.error('Error al iniciar el servidor:', err);
        process.exit(1);
    }
});


