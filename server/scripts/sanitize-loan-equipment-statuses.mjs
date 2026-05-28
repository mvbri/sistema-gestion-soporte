import dotenv from 'dotenv';
import Equipment from '../src/models/Equipment.js';

dotenv.config();

try {
    const affectedRows = await Equipment.syncActiveLoanAssignments();
    console.log(`Saneamiento ejecutado correctamente. Filas corregidas: ${affectedRows}`);
    process.exit(0);
} catch (error) {
    console.error('Error ejecutando saneamiento:', error.message);
    process.exit(1);
}
