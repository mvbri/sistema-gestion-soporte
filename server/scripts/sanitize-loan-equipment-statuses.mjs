import dotenv from 'dotenv';
import { query } from '../src/config/database.js';

dotenv.config();

const sql = `
  UPDATE equipment e
  LEFT JOIN (
    SELECT DISTINCT eli.equipment_id
    FROM equipment_loan_items eli
    INNER JOIN equipment_loans el ON el.id = eli.loan_id
    WHERE eli.active = TRUE
      AND el.active = TRUE
      AND el.status IN ('delivered', 'overdue')
      AND eli.equipment_id IS NOT NULL
  ) active_loans ON active_loans.equipment_id = e.id
  SET
    e.status = CASE
      WHEN active_loans.equipment_id IS NULL THEN 'available'
      ELSE 'assigned'
    END,
    e.assigned_to_user_id = CASE
      WHEN active_loans.equipment_id IS NULL THEN NULL
      ELSE e.assigned_to_user_id
    END
  WHERE e.active = TRUE
    AND (e.status = 'assigned' OR active_loans.equipment_id IS NOT NULL)
`;

try {
  const result = await query(sql);
  const affectedRows = Number(result?.affectedRows ?? result?.[0]?.affectedRows ?? 0);
  console.log(`Saneamiento ejecutado correctamente. Filas afectadas: ${affectedRows}`);
  process.exit(0);
} catch (error) {
  console.error('Error ejecutando saneamiento:', error.message);
  process.exit(1);
}
