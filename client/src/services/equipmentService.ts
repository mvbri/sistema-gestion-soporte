import api from '../utils/api';
import type {
  ApiResponse,
  Equipment,
  EquipmentFilters,
  EquipmentResponse,
  EquipmentStats,
  EquipmentTypeOption,
  EquipmentStatusOption
} from '../types';

export interface CreateEquipmentData {
  name: string;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  type_id: number;
  type?: string;
  status?: string;
  location?: string | null;
  assigned_to_user_id?: number | null;
  description?: string | null;
  purchase_date?: string | null;
  warranty_expires_at?: string | null;
}

export interface UpdateEquipmentData {
  name?: string;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  type_id?: number;
  type?: string;
  status?: string;
  location?: string | null;
  assigned_to_user_id?: number | null;
  description?: string | null;
  purchase_date?: string | null;
  warranty_expires_at?: string | null;
}

export interface AssignEquipmentData {
  user_id: number;
}

export const equipmentService = {
  async create(data: CreateEquipmentData): Promise<ApiResponse<Equipment>> {
    const response = await api.post<ApiResponse<Equipment>>('/equipment', data);
    return response.data;
  },

  async getAll(filters?: EquipmentFilters): Promise<ApiResponse<EquipmentResponse>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get<ApiResponse<EquipmentResponse>>(`/equipment?${params.toString()}`);
    return response.data;
  },

  async getById(id: number): Promise<ApiResponse<Equipment>> {
    const response = await api.get<ApiResponse<Equipment>>(`/equipment/${id}`);
    return response.data;
  },

  async update(id: number, data: UpdateEquipmentData): Promise<ApiResponse<Equipment>> {
    const response = await api.put<ApiResponse<Equipment>>(`/equipment/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/equipment/${id}`);
    return response.data;
  },

  async assign(id: number, data: AssignEquipmentData): Promise<ApiResponse<Equipment>> {
    const response = await api.patch<ApiResponse<Equipment>>(`/equipment/${id}/assign`, data);
    return response.data;
  },

  async unassign(id: number): Promise<ApiResponse<Equipment>> {
    const response = await api.patch<ApiResponse<Equipment>>(`/equipment/${id}/unassign`);
    return response.data;
  },

  async getStats(): Promise<ApiResponse<EquipmentStats>> {
    const response = await api.get<ApiResponse<EquipmentStats>>('/equipment/stats');
    return response.data;
  },

  async getTypes(): Promise<ApiResponse<EquipmentTypeOption[]>> {
    const response = await api.get<ApiResponse<EquipmentTypeOption[]>>('/equipment/types');
    return response.data;
  },

  async getStatuses(): Promise<ApiResponse<EquipmentStatusOption[]>> {
    const response = await api.get<ApiResponse<EquipmentStatusOption[]>>('/equipment/statuses');
    return response.data;
  },
};
