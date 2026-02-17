import { createContext } from 'react';
import type { User } from '../types';
import type { LoginData, RegisterData, UpdateProfileData } from '../services/authService';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

