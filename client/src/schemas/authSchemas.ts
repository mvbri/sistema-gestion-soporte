import { z } from 'zod';

export const registroSchema = z.object({
  full_name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('El email no es válido'),
  
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, 'El teléfono no es válido')
    .min(10, 'El teléfono debe tener al menos 10 caracteres')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  
  incident_area_id: z
    .number()
    .int()
    .min(1, 'La dirección es requerida'),
});

export const perfilSchema = z.object({
  full_name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre no puede exceder 255 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),

  phone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, 'El teléfono no es válido')
    .min(10, 'El teléfono debe tener al menos 10 caracteres')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),

  incident_area_id: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined || val === 0) return undefined;
      const num = Number(val);
      return isNaN(num) || num <= 0 ? undefined : num;
    },
    z
      .number({
        required_error: 'La dirección es requerida',
        invalid_type_error: 'La dirección es requerida',
      })
      .int('La dirección es requerida')
      .min(1, 'La dirección es requerida')
  ),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('El email no es válido'),
  
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
});

export const recuperacionSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('El email no es válido'),
});

export const restablecerPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const securityQuestionsSchema = z.object({
  question1: z
    .string()
    .min(10, 'La pregunta debe tener al menos 10 caracteres')
    .max(255, 'La pregunta no puede exceder 255 caracteres'),
  answer1: z
    .string()
    .min(3, 'La respuesta debe tener al menos 3 caracteres'),
  question2: z
    .string()
    .min(10, 'La pregunta debe tener al menos 10 caracteres')
    .max(255, 'La pregunta no puede exceder 255 caracteres'),
  answer2: z
    .string()
    .min(3, 'La respuesta debe tener al menos 3 caracteres'),
});

export const verifySecurityAnswersSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('El email no es válido'),
  answer1: z
    .string()
    .min(3, 'La respuesta debe tener al menos 3 caracteres'),
  answer2: z
    .string()
    .min(3, 'La respuesta debe tener al menos 3 caracteres'),
});

