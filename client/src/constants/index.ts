export const ROLES = {
  ADMIN: 'admin',
  TECHNICIAN: 'technician',
  END_USER: 'end_user',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  REGISTRO: '/registro',
  DASHBOARD: '/dashboard',
  VERIFICAR_EMAIL: '/verificar-email',
  RECUPERAR_PASSWORD: '/recuperar-password',
  RESTABLECER_PASSWORD: '/restablecer-password',
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
} as const;

export const TICKET_CLOSURE_CATEGORIES = [
  { value: 'solved', label: 'Solucionado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'duplicate', label: 'Duplicado' },
  { value: 'other', label: 'Otro' },
] as const;

export type TicketClosureCategoryValue =
  (typeof TICKET_CLOSURE_CATEGORIES)[number]['value'];

