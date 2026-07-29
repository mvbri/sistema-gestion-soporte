import { z } from 'zod';

const requiredSelectId = (message: string) =>
  z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return undefined;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? undefined : parsed;
    },
    z.number({ required_error: message }).int().min(1, message)
  );

export const createTicketSchema = z.object({
  titulo: z
    .string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(255, 'El título no puede exceder 255 caracteres'),
  
  descripcion: z
    .string()
    .min(20, 'La descripción debe tener al menos 20 caracteres'),
  
  area_incidente: z
    .string()
    .min(1, 'El área del incidente es requerida')
    .max(255, 'El área del incidente no puede exceder 255 caracteres'),
  
  categoria_id: requiredSelectId('La categoría es obligatoria'),
  
  prioridad_id: requiredSelectId('La prioridad es obligatoria'),
  
  imagen: z
    .any()
    .optional(),
});

export const updateTicketSchema = z.object({
  titulo: z
    .string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(255, 'El título no puede exceder 255 caracteres')
    .optional(),
  
  descripcion: z
    .string()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .optional(),
  
  area_incidente: z
    .string()
    .min(1, 'El área del incidente es requerida')
    .max(255, 'El área del incidente no puede exceder 255 caracteres')
    .optional(),
  
  categoria_id: z
    .number()
    .int()
    .min(1, 'La categoría debe ser válida')
    .optional(),
  
  prioridad_id: z
    .number()
    .int()
    .min(1, 'La prioridad debe ser válida')
    .optional(),
  
  estado_id: z
    .number()
    .int()
    .min(1, 'El estado debe ser válido')
    .optional(),
  
  tecnico_asignado_id: z
    .number()
    .int()
    .min(1, 'El técnico asignado debe ser válido')
    .nullable()
    .optional(),
});

export const commentSchema = z.object({
  contenido: z
    .string()
    .min(5, 'El comentario debe tener al menos 5 caracteres'),
});

export type CreateTicketData = z.infer<typeof createTicketSchema>;
export type UpdateTicketData = z.infer<typeof updateTicketSchema>;
export type CommentData = z.infer<typeof commentSchema>;
