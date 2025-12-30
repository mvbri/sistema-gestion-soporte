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

