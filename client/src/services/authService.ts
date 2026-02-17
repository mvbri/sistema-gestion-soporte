import api from '../utils/api';
import type { AuthResponse, ApiResponse, User } from '../types';

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;
  phone?: string | null;
  department: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  full_name: string;
  phone?: string | null;
  department: string;
}

export const authService = {
  async register(data: RegisterData): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData, rememberMe: boolean = false): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.success && response.data.data) {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', response.data.data.token);
      storage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await api.get<ApiResponse>('/auth/verify-email', {
      params: { token },
    });
    return response.data;
  },

  async resendVerification(email: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/resend-verification', { email });
    return response.data;
  },

  async requestPasswordRecovery(email: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/request-password-recovery', { email });
    return response.data;
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },

  async getSecurityQuestions(email: string): Promise<ApiResponse<{ question1: string; question2: string }>> {
    const response = await api.post<ApiResponse<{ question1: string; question2: string }>>('/auth/get-security-questions', { email });
    return response.data;
  },

  async verifySecurityAnswers(email: string, answer1: string, answer2: string): Promise<ApiResponse<{ token: string }>> {
    const response = await api.post<ApiResponse<{ token: string }>>('/auth/verify-security-answers', {
      email,
      answer1,
      answer2,
    });
    return response.data;
  },

  async setSecurityQuestions(question1: string, answer1: string, question2: string, answer2: string): Promise<ApiResponse> {
    const response = await api.put<ApiResponse>('/auth/security-questions', {
      question1,
      answer1,
      question2,
      answer2,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>('/auth/current-user');
    return response.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<User>> {
    const response = await api.put<ApiResponse<User>>('/auth/profile', data);
    const result = response.data;

    if (result.success && result.data) {
      const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(result.data));
    }

    return result;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },

  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  },

  getUser(): User | null {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

