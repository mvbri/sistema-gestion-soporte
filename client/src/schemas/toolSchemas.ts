import { z } from 'zod';

export const createToolSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres'),

  code: z
    .string()
    .max(100, 'El código no puede exceder 100 caracteres')
    .optional()
    .nullable(),

  type_id: z
    .number()
    .int()
    .min(1, 'El tipo de herramienta es requerido'),

  status: z
    .enum(['available', 'assigned', 'maintenance', 'lost', 'retired'], {
      errorMap: () => ({ message: 'El estado de la herramienta no es válido' }),
    })
    .optional(),

  condition: z
    .enum(['new', 'good', 'worn', 'broken'], {
      errorMap: () => ({ message: 'La condición de la herramienta no es válida' }),
    })
    .optional(),

  location: z
    .string()
    .max(255, 'La ubicación no puede exceder 255 caracteres')
    .optional()
    .nullable(),

  assigned_to_user_id: z
    .number()
    .int()
    .min(1, 'El ID del usuario debe ser válido')
    .optional()
    .nullable(),

  description: z
    .string()
    .optional()
    .nullable(),
});

export const updateToolSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .optional(),

  code: z
    .string()
    .max(100, 'El código no puede exceder 100 caracteres')
    .optional()
    .nullable(),

  type_id: z
    .number()
    .int()
    .min(1, 'El tipo de herramienta debe ser válido')
    .optional(),

  status: z
    .enum(['available', 'assigned', 'maintenance', 'lost', 'retired'], {
      errorMap: () => ({ message: 'El estado de la herramienta no es válido' }),
    })
    .optional(),

  condition: z
    .enum(['new', 'good', 'worn', 'broken'], {
      errorMap: () => ({ message: 'La condición de la herramienta no es válida' }),
    })
    .optional(),

  location: z
    .string()
    .max(255, 'La ubicación no puede exceder 255 caracteres')
    .optional()
    .nullable(),

  assigned_to_user_id: z
    .union([
      z.number().int().min(1, 'El ID del usuario debe ser válido'),
      z.null(),
    ])
    .optional(),

  description: z
    .string()
    .optional()
    .nullable(),
});

export type CreateToolData = z.infer<typeof createToolSchema>;
export type UpdateToolData = z.infer<typeof updateToolSchema>;

