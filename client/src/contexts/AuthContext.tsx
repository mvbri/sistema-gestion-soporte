import React, { useState, useEffect, ReactNode, useRef } from 'react';
import { authService } from '../services/authService';
import type { LoginData, RegisterData, UpdateProfileData } from '../services/authService';
import type { User } from '../types';
import { AuthContext } from './authContext';
import { queryClient } from '../config/queryClient';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const previousUserIdRef = useRef<number | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const response = await authService.getCurrentUser();
          if (response.success && response.data) {
            const newUser = response.data;
            const previousUserId = previousUserIdRef.current;
            
            if (previousUserId !== null && previousUserId !== newUser.id) {
              queryClient.clear();
            }
            
            setUser(newUser);
            previousUserIdRef.current = newUser.id;
          } else {
            authService.logout();
            queryClient.clear();
            previousUserIdRef.current = null;
          }
        } catch (error) {
          console.error('Error al obtener el usuario actual:', error);
          authService.logout();
          queryClient.clear();
          previousUserIdRef.current = null;
        }
      } else {
        queryClient.clear();
        previousUserIdRef.current = null;
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginData, rememberMe: boolean = false) => {
    const response = await authService.login(data, rememberMe);
    if (response.success && response.data) {
      queryClient.clear();
      const newUser = response.data.user;
      setUser(newUser);
      previousUserIdRef.current = newUser.id;
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
    try {
      const response = await authService.updateProfile(data);

      if (response.success && response.data) {
        setUser(response.data);
        return;
      }

      const errorMessage = response.message?.toLowerCase() || '';
      if (errorMessage.includes('dirección') || errorMessage.includes('incident_area_id')) {
        throw new Error('dirección_obligatoria');
      }
      throw new Error(response.message || 'Error al actualizar perfil');
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        const backendMessage = axiosError.response?.data?.message?.toLowerCase() || '';

        if (backendMessage.includes('dirección') || backendMessage.includes('incident_area_id')) {
          throw new Error('dirección_obligatoria');
        }

        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Error al actualizar perfil');
    }
  };

  const logout = () => {
    queryClient.clear();
    authService.logout();
    setUser(null);
    previousUserIdRef.current = null;
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


