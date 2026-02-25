import api from '../utils/api';
import type {
  ApiResponse,
  Consumable,
  ConsumableFilters,
  ConsumableResponse,
  ConsumableStats,
  ConsumableTypeOption,
  ConsumableStatusOption,
} from '../types';

export interface CreateConsumableData {
  name: string;
  type_id: number;
  unit: string;
  quantity?: number;
  minimum_quantity?: number;
  status?: string;
  description?: string | null;
}

export interface UpdateConsumableData {
  name?: string;
  type_id?: number;
  unit?: string;
  quantity?: number;
  minimum_quantity?: number;
  status?: string;
  description?: string | null;
}

export const consumableService = {
  async create(data: CreateConsumableData): Promise<ApiResponse<Consumable>> {
    const response = await api.post<ApiResponse<Consumable>>('/consumables', data);
    return response.data;
  },

  async getAll(filters?: ConsumableFilters): Promise<ApiResponse<ConsumableResponse>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    const url = query ? `/consumables?${query}` : '/consumables';
    const response = await api.get<ApiResponse<ConsumableResponse>>(url);
    return response.data;
  },

  async getById(id: number): Promise<ApiResponse<Consumable>> {
    const response = await api.get<ApiResponse<Consumable>>(`/consumables/${id}`);
    return response.data;
  },

  async update(id: number, data: UpdateConsumableData): Promise<ApiResponse<Consumable>> {
    const response = await api.put<ApiResponse<Consumable>>(`/consumables/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/consumables/${id}`);
    return response.data;
  },

  async getStats(): Promise<ApiResponse<ConsumableStats>> {
    const response = await api.get<ApiResponse<ConsumableStats>>('/consumables/stats');
    return response.data;
  },

  async getTypes(): Promise<ApiResponse<ConsumableTypeOption[]>> {
    const response = await api.get<ApiResponse<ConsumableTypeOption[]>>('/consumables/types');
    return response.data;
  },

  async getStatuses(): Promise<ApiResponse<ConsumableStatusOption[]>> {
    const response = await api.get<ApiResponse<ConsumableStatusOption[]>>('/consumables/statuses');
    return response.data;
  },
};

