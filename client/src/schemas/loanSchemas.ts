import { z } from 'zod';

export const loanItemSchema = z
  .object({
    equipment_id: z.number().int().positive().optional(),
    pool_id: z.number().int().positive().optional(),
    quantity: z.number().int().positive().default(1),
  })
  .refine(
    (item) =>
      (item.equipment_id !== undefined && item.pool_id === undefined) ||
      (item.equipment_id === undefined && item.pool_id !== undefined),
    {
      message: 'Cada item debe tener equipo serial o pool, pero no ambos',
    }
  );

export const createLoanRequestSchema = z
  .object({
    target_incident_area_id: z.number().int().positive('Debe seleccionar el área destino'),
    start_date: z.string().min(1, 'Fecha de inicio requerida'),
    expected_return_date: z.string().min(1, 'Fecha de devolución requerida'),
    request_notes: z.string().max(1000).optional(),
    items: z.array(loanItemSchema).min(1, 'Debe agregar al menos un item'),
  })
  .refine((data) => data.expected_return_date >= data.start_date, {
    message: 'La fecha de devolución no puede ser anterior a la fecha de inicio',
    path: ['expected_return_date'],
  });
