import dotenv from 'dotenv';
import { query } from '../src/config/database.js';

dotenv.config();

const equipmentId = Number(process.argv[2] || 0);

if (!Number.isInteger(equipmentId) || equipmentId <= 0) {
  console.error('Uso: node ./scripts/debug-equipment-loans.mjs <equipmentId>');
  process.exit(1);
}

try {
  const equipment = await query(
    'SELECT id, name, status, assigned_to_user_id, active FROM equipment WHERE id = ?',
    [equipmentId]
  );
  const relatedLoans = await query(
    `SELECT
        el.id AS loan_id,
        el.status AS loan_status,
        el.active AS loan_active,
        eli.active AS item_active
     FROM equipment_loan_items eli
     INNER JOIN equipment_loans el ON el.id = eli.loan_id
     WHERE eli.equipment_id = ?
     ORDER BY el.id DESC`,
    [equipmentId]
  );

  console.log('Equipo:', equipment);
  console.log('Prestamos relacionados:', relatedLoans);
  process.exit(0);
} catch (error) {
  console.error('Error consultando trazabilidad del equipo:', error.message);
  process.exit(1);
}
