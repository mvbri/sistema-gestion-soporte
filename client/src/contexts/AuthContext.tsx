import React, { useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import type { LoginData, RegisterData, UpdateProfileData } from '../services/authService';
import type { User } from '../types';
import { AuthContext } from './authContext';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            authService.logout();
          }
        } catch (error) {
          console.error('Error al obtener el usuario actual:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginData, rememberMe: boolean = false) => {
    const response = await authService.login(data, rememberMe);
    if (response.success && response.data) {
      setUser(response.data.user);
    } else {
      throw new Error(response.message);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    const response = await authService.register(data);
    if (!response.success) {
      throw new Error(response.message || 'Error al registrar usuario');
    }
  };

  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    const response = await authService.updateProfile(data);
    if (response.success && response.data) {
      setUser(response.data);
    } else {
      throw new Error(response.message || 'Error al actualizar perfil');
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateProfile,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


