import { z } from 'zod';

export const createTicketSchema = z.object({
  titulo: z
    .string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(255, 'El título no puede exceder 255 caracteres'),
  
  descripcion: z
    .string()
    .min(20, 'La descripción debe tener al menos 20 caracteres'),
  categoria_id: z
    .number()
    .int()
    .min(1, 'La categoría es requerida'),
  
  prioridad_id: z
    .number()
    .int()
    .min(1, 'La prioridad es requerida'),
  
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
    .union([
      z.number().int().min(1, 'El técnico asignado debe ser válido'),
      z.null(),
    ])
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
