import { z } from 'zod';

export const createEquipmentSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres'),
  
  brand: z
    .string()
    .min(1, 'La marca es requerida')
    .max(100, 'La marca no puede exceder 100 caracteres'),
  
  model: z
    .string()
    .min(1, 'El modelo es requerido')
    .max(100, 'El modelo no puede exceder 100 caracteres'),
  
  serial_number: z
    .string()
    .min(1, 'El número de serie es requerido')
    .max(100, 'El número de serie no puede exceder 100 caracteres'),
  
  type_id: z
    .number()
    .int()
    .min(1, 'El tipo de equipo es requerido'),
  
  type: z
    .string()
    .optional(),
  
  status: z
    .enum(['available', 'assigned', 'maintenance', 'retired'], {
      errorMap: () => ({ message: 'El estado del equipo no es válido' })
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
  
  purchase_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de compra debe tener el formato YYYY-MM-DD')
    .optional()
    .nullable(),
  
  warranty_expires_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de expiración de garantía debe tener el formato YYYY-MM-DD')
    .optional()
    .nullable(),
});

export const updateEquipmentSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .optional(),
  
  brand: z
    .string()
    .max(100, 'La marca no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  
  model: z
    .string()
    .max(100, 'El modelo no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  
  serial_number: z
    .string()
    .max(100, 'El número de serie no puede exceder 100 caracteres')
    .optional()
    .nullable(),
  
  type_id: z
    .number()
    .int()
    .min(1, 'El tipo de equipo debe ser válido')
    .optional(),
  
  type: z
    .string()
    .optional(),
  
  status: z
    .enum(['available', 'assigned', 'maintenance', 'retired'], {
      errorMap: () => ({ message: 'El estado del equipo no es válido' })
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
  
  purchase_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de compra debe tener el formato YYYY-MM-DD')
    .optional()
    .nullable(),
  
  warranty_expires_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha de expiración de garantía debe tener el formato YYYY-MM-DD')
    .optional()
    .nullable(),
});

export const assignEquipmentSchema = z.object({
  user_id: z
    .number()
    .int()
    .min(1, 'El ID del usuario es requerido'),
});

export type CreateEquipmentData = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentData = z.infer<typeof updateEquipmentSchema>;
export type AssignEquipmentData = z.infer<typeof assignEquipmentSchema>;
