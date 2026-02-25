import { z } from 'zod';

export const createConsumableSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres'),

  type_id: z
    .number()
    .int()
    .min(1, 'El tipo de consumible es requerido'),

  unit: z
    .string()
    .min(1, 'La unidad es requerida')
    .max(50, 'La unidad no puede exceder 50 caracteres'),

  quantity: z
    .number()
    .int()
    .min(0, 'La cantidad debe ser mayor o igual a 0')
    .optional(),

  minimum_quantity: z
    .number()
    .int()
    .min(0, 'La cantidad mínima debe ser mayor o igual a 0')
    .optional(),

  status: z
    .enum(['available', 'low_stock', 'out_of_stock', 'inactive'], {
      errorMap: () => ({ message: 'El estado del consumible no es válido' }),
    })
    .optional(),

  description: z
    .string()
    .optional()
    .nullable(),
});

export const updateConsumableSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .optional(),

  type_id: z
    .number()
    .int()
    .min(1, 'El tipo de consumible debe ser válido')
    .optional(),

  unit: z
    .string()
    .max(50, 'La unidad no puede exceder 50 caracteres')
    .optional(),

  quantity: z
    .number()
    .int()
    .min(0, 'La cantidad debe ser mayor o igual a 0')
    .optional(),

  minimum_quantity: z
    .number()
    .int()
    .min(0, 'La cantidad mínima debe ser mayor o igual a 0')
    .optional(),

  status: z
    .enum(['available', 'low_stock', 'out_of_stock', 'inactive'], {
      errorMap: () => ({ message: 'El estado del consumible no es válido' }),
    })
    .optional(),

  description: z
    .string()
    .optional()
    .nullable(),
});

export type CreateConsumableData = z.infer<typeof createConsumableSchema>;
export type UpdateConsumableData = z.infer<typeof updateConsumableSchema>;

