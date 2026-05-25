import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import MaterialRequest from '../src/models/MaterialRequest.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

try {
    const created = await MaterialRequest.create({
        requester_user_id: 5,
        request_notes: 'Prueba migración addressee_addressing_text',
        addressee_name: 'Maria Perez',
        addressee_title: 'Directora general',
        addressee_addressing_text:
            'Por medio de la presente solicito materiales para la dirección general del área correspondiente.',
        items: [
            {
                source_mode: 'manual',
                material_type: 'equipment',
                custom_material_name: 'Equipo prueba migración',
                quantity: 1,
            },
        ],
    });

    console.log('OK: solicitud creada id=', created.id);
    console.log('  addressee_addressing_text:', created.addressee_addressing_text?.slice(0, 60) + '...');
    process.exit(0);
} catch (err) {
    console.error('FAIL:', err.message);
    process.exit(1);
}
