-- Migration: Sync equipment assignment with active loan reservations
-- Fixes equipment showing "available" while an approved/delivered/overdue loan is active.

USE sistema_soporte;

UPDATE equipment e
INNER JOIN (
    SELECT eli.equipment_id, el.requester_user_id
    FROM equipment_loan_items eli
    INNER JOIN equipment_loans el ON el.id = eli.loan_id
    WHERE eli.active = TRUE
      AND el.active = TRUE
      AND el.status IN ('approved', 'delivered', 'overdue')
      AND eli.equipment_id IS NOT NULL
) active ON active.equipment_id = e.id
SET e.status = 'assigned',
    e.assigned_to_user_id = active.requester_user_id
WHERE e.active = TRUE
  AND (
      e.status <> 'assigned'
      OR e.assigned_to_user_id IS NULL
      OR e.assigned_to_user_id <> active.requester_user_id
  );
