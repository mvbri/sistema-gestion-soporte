import axios from 'axios';

export type ApiErrorBody = {
  success?: boolean;
  message?: string;
  errors?: Array<{ msg?: string; message?: string; field?: string }> | Record<string, unknown>;
  error?: string;
  data?: unknown;
};

const STATUS_FALLBACKS: Record<number, string> = {
  400: 'Solicitud inválida. Revisa los datos enviados.',
  403: 'Acceso denegado. Verifica tus permisos o la verificación de seguridad.',
  404: 'Recurso no encontrado.',
  500: 'Error interno del servidor. Intenta más tarde.',
  503: 'Servicio temporalmente no disponible.',
};

const GENERIC_HTTP_TEXT =
  /^(Forbidden|Unauthorized|Not Found|Internal Server Error|Bad Request|Conflict|Unprocessable Entity)$/i;

/**
 * Normaliza un mensaje de error del API evitando textos genéricos HTTP.
 */
export function sanitizeApiMessage(message: string | undefined | null, fallback: string): string {
  const trimmed = message?.trim();
  if (trimmed && !GENERIC_HTTP_TEXT.test(trimmed)) {
    return trimmed;
  }
  return fallback;
}

/**
 * Extrae el cuerpo JSON de error de una respuesta axios del backend.
 */
export function getApiErrorBody(error: unknown): ApiErrorBody | null {
  if (!axios.isAxiosError(error)) {
    return null;
  }

  const data = error.response?.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as ApiErrorBody;
  }

  return null;
}

/**
 * Obtiene un mensaje legible desde errores axios/API.
 * Evita mostrar textos genéricos del protocolo HTTP como "Forbidden".
 */
export function getApiErrorMessage(error: unknown, fallback = 'Ha ocurrido un error inesperado'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (typeof data === 'string' && data.trim() && !GENERIC_HTTP_TEXT.test(data.trim())) {
      return data.trim();
    }

    const body = getApiErrorBody(error);
    if (body) {
      if (Array.isArray(body.errors) && body.errors.length > 0) {
        const validationMessages = body.errors
          .map((entry) => entry.message || entry.msg)
          .filter((msg): msg is string => Boolean(msg));

        if (validationMessages.length > 0) {
          return validationMessages.join(', ');
        }
      }

      if (body.message?.trim() && !GENERIC_HTTP_TEXT.test(body.message.trim())) {
        return body.message.trim();
      }

      if (typeof body.error === 'string' && body.error.trim() && !GENERIC_HTTP_TEXT.test(body.error.trim())) {
        return body.error.trim();
      }
    }

    const status = error.response?.status;
    if (status && STATUS_FALLBACKS[status]) {
      return STATUS_FALLBACKS[status];
    }
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    if (
      message &&
      !message.startsWith('Request failed with status code') &&
      !GENERIC_HTTP_TEXT.test(message)
    ) {
      return message;
    }
  }

  return fallback;
}
