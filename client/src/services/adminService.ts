import api from '../utils/api';
import type { ApiResponse, CategoriaTicket, PrioridadTicket } from '../types';

export interface CreateCategoriaData {
  nombre: string;
  descripcion?: string;
}

export interface UpdateCategoriaData {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CreatePrioridadData {
  nombre: string;
  nivel: number;
  color: string;
  descripcion?: string;
}

export interface UpdatePrioridadData {
  nombre?: string;
  nivel?: number;
  color?: string;
  descripcion?: string;
  activo?: boolean;
}

export const adminService = {
  async getCategorias(): Promise<ApiResponse<CategoriaTicket[]>> {
    const response = await api.get<ApiResponse<CategoriaTicket[]>>('/admin/categorias');
    return response.data;
  },

  async createCategoria(data: CreateCategoriaData): Promise<ApiResponse<CategoriaTicket>> {
    const response = await api.post<ApiResponse<CategoriaTicket>>('/admin/categorias', data);
    return response.data;
  },

  async updateCategoria(id: number, data: UpdateCategoriaData): Promise<ApiResponse<CategoriaTicket>> {
    const response = await api.put<ApiResponse<CategoriaTicket>>(`/admin/categorias/${id}`, data);
    return response.data;
  },

  async getPrioridades(): Promise<ApiResponse<PrioridadTicket[]>> {
    const response = await api.get<ApiResponse<PrioridadTicket[]>>('/admin/prioridades');
    return response.data;
  },

  async createPrioridad(data: CreatePrioridadData): Promise<ApiResponse<PrioridadTicket>> {
    const response = await api.post<ApiResponse<PrioridadTicket>>('/admin/prioridades', data);
    return response.data;
  },

  async updatePrioridad(id: number, data: UpdatePrioridadData): Promise<ApiResponse<PrioridadTicket>> {
    const response = await api.put<ApiResponse<PrioridadTicket>>(`/admin/prioridades/${id}`, data);
    return response.data;
  },
};
