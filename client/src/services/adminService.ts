import api from '../utils/api';
import type { ApiResponse, CategoriaTicket, PrioridadTicket, EstadoTicket, DireccionTicket, EquipmentType, ConsumableType, ToolType, User } from '../types';

export interface CreateCategoriaData {
  name: string;
  description?: string;
}

export interface UpdateCategoriaData {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface CreatePrioridadData {
  name: string;
  level: number;
  color: string;
  description?: string;
}

export interface UpdatePrioridadData {
  name?: string;
  level?: number;
  color?: string;
  description?: string;
  active?: boolean;
}

export interface CreateEstadoData {
  name: string;
  color?: string;
  description?: string;
  order?: number;
}

export interface UpdateEstadoData {
  name?: string;
  color?: string;
  description?: string;
  order?: number;
  active?: boolean;
}

export interface CreateDireccionData {
  name: string;
  description?: string;
}

export interface UpdateDireccionData {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface CreateEquipmentTypeData {
  name: string;
  description?: string;
}

export interface UpdateEquipmentTypeData {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface CreateConsumableTypeData {
  name: string;
  description?: string;
}

export interface UpdateConsumableTypeData {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface CreateToolTypeData {
  name: string;
  description?: string;
}

export interface UpdateToolTypeData {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface DireccionesFilters {
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: 'name' | 'description' | 'active' | 'created_at' | 'updated_at';
  orderDirection?: 'ASC' | 'DESC';
}

export interface CreateUserData {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  incident_area_id?: number;
  role_id?: number;
  active?: boolean;
}

export interface UpdateUserStatusData {
  active: boolean;
}

export interface UpdateUserData {
  full_name?: string;
  email?: string;
  phone?: string;
  incident_area_id?: number;
  role_id?: number;
  active?: boolean;
  password?: string;
}

export interface UsersFilters {
  active?: boolean;
  role_id?: number;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: 'id' | 'full_name' | 'email' | 'created_at' | 'updated_at' | 'active';
  orderDirection?: 'ASC' | 'DESC';
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

  async deleteCategoria(id: number): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/admin/categorias/${id}`);
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

  async deletePrioridad(id: number): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/admin/prioridades/${id}`);
    return response.data;
  },

  async getEstados(): Promise<ApiResponse<EstadoTicket[]>> {
    const response = await api.get<ApiResponse<EstadoTicket[]>>('/admin/estados');
    return response.data;
  },

  async createEstado(data: CreateEstadoData): Promise<ApiResponse<EstadoTicket>> {
    const response = await api.post<ApiResponse<EstadoTicket>>('/admin/estados', data);
    return response.data;
  },

  async updateEstado(id: number, data: UpdateEstadoData): Promise<ApiResponse<EstadoTicket>> {
    const response = await api.put<ApiResponse<EstadoTicket>>(`/admin/estados/${id}`, data);
    return response.data;
  },

  async deleteEstado(id: number): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/admin/estados/${id}`);
    return response.data;
  },

  async getDirecciones(filters?: DireccionesFilters): Promise<ApiResponse<{ direcciones: DireccionTicket[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.orderBy) params.append('orderBy', filters.orderBy);
      if (filters.orderDirection) params.append('orderDirection', filters.orderDirection);
    }
    const queryString = params.toString();
    const url = `/admin/direcciones${queryString ? `?${queryString}` : ''}`;
    const response = await api.get<ApiResponse<{ direcciones: DireccionTicket[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>>(url);
    return response.data;
  },

  async createDireccion(data: CreateDireccionData): Promise<ApiResponse<DireccionTicket>> {
    const response = await api.post<ApiResponse<DireccionTicket>>('/admin/direcciones', data);
    return response.data;
  },

  async updateDireccion(id: number, data: UpdateDireccionData): Promise<ApiResponse<DireccionTicket>> {
    const response = await api.put<ApiResponse<DireccionTicket>>(`/admin/direcciones/${id}`, data);
    return response.data;
  },

  async deleteDireccion(id: number): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/admin/direcciones/${id}`);
    return response.data;
  },

  async getEquipmentTypes(): Promise<ApiResponse<EquipmentType[]>> {
    const response = await api.get<ApiResponse<EquipmentType[]>>('/admin/equipment-types');
    return response.data;
  },

  async createEquipmentType(data: CreateEquipmentTypeData): Promise<ApiResponse<EquipmentType>> {
    const response = await api.post<ApiResponse<EquipmentType>>('/admin/equipment-types', data);
    return response.data;
  },

  async updateEquipmentType(id: number, data: UpdateEquipmentTypeData): Promise<ApiResponse<EquipmentType>> {
    const response = await api.put<ApiResponse<EquipmentType>>(`/admin/equipment-types/${id}`, data);
    return response.data;
  },

  async deleteEquipmentType(id: number): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/admin/equipment-types/${id}`);
    return response.data;
  },

  async getConsumableTypes(): Promise<ApiResponse<ConsumableType[]>> {
    const response = await api.get<ApiResponse<ConsumableType[]>>('/admin/consumable-types');
    return response.data;
  },

  async createConsumableType(data: CreateConsumableTypeData): Promise<ApiResponse<ConsumableType>> {
    const response = await api.post<ApiResponse<ConsumableType>>('/admin/consumable-types', data);
    return response.data;
  },

  async updateConsumableType(id: number, data: UpdateConsumableTypeData): Promise<ApiResponse<ConsumableType>> {
    const response = await api.put<ApiResponse<ConsumableType>>(`/admin/consumable-types/${id}`, data);
    return response.data;
  },

  async deleteConsumableType(id: number): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/admin/consumable-types/${id}`);
    return response.data;
  },

  async getToolTypes(): Promise<ApiResponse<ToolType[]>> {
    const response = await api.get<ApiResponse<ToolType[]>>('/admin/tool-types');
    return response.data;
  },

  async createToolType(data: CreateToolTypeData): Promise<ApiResponse<ToolType>> {
    const response = await api.post<ApiResponse<ToolType>>('/admin/tool-types', data);
    return response.data;
  },

  async updateToolType(id: number, data: UpdateToolTypeData): Promise<ApiResponse<ToolType>> {
    const response = await api.put<ApiResponse<ToolType>>(`/admin/tool-types/${id}`, data);
    return response.data;
  },

  async deleteToolType(id: number): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/admin/tool-types/${id}`);
    return response.data;
  },

  async getUsers(filters?: UsersFilters): Promise<ApiResponse<UsersResponse>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.active !== undefined) params.append('active', filters.active.toString());
      if (filters.role_id !== undefined) params.append('role_id', filters.role_id.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.orderBy) params.append('orderBy', filters.orderBy);
      if (filters.orderDirection) params.append('orderDirection', filters.orderDirection);
    }
    const queryString = params.toString();
    const url = `/admin/users${queryString ? `?${queryString}` : ''}`;
    const response = await api.get<ApiResponse<UsersResponse>>(url);
    return response.data;
  },

  async createUser(data: CreateUserData): Promise<ApiResponse<User>> {
    const response = await api.post<ApiResponse<User>>('/admin/users', data);
    return response.data;
  },

  async updateUserStatus(id: number, data: UpdateUserStatusData): Promise<ApiResponse<User>> {
    const response = await api.patch<ApiResponse<User>>(`/admin/users/${id}/status`, data);
    return response.data;
  },

  async updateUser(id: number, data: UpdateUserData): Promise<ApiResponse<User>> {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/admin/users/${id}`);
    return response.data;
  },

  async verifyUserEmail(id: number): Promise<ApiResponse<User>> {
    const response = await api.patch<ApiResponse<User>>(`/admin/users/${id}/verify-email`);
    return response.data;
  },
};
