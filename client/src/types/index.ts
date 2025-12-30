export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'administrator' | 'technician' | 'end_user';
  phone?: string;
  department?: string;
  email_verified: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ msg: string; param: string }>;
}

export type Role = 'administrator' | 'technician' | 'end_user';

