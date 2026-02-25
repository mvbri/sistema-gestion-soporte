import api from '../utils/api';
import type {
  ApiResponse,
  Tool,
  ToolFilters,
  ToolResponse,
  ToolStats,
  ToolTypeOption,
  ToolStatusOption,
} from '../types';

export interface CreateToolData {
  name: string;
  code?: string | null;
  type_id: number;
  type?: string;
  status?: string;
  condition?: string;
  location?: string | null;
  assigned_to_user_id?: number | null;
  description?: string | null;
}

export interface UpdateToolData {
  name?: string;
  code?: string | null;
  type_id?: number;
  type?: string;
  status?: string;
  condition?: string;
  location?: string | null;
  assigned_to_user_id?: number | null;
  description?: string | null;
}

export interface AssignToolData {
  user_id: number;
}

export const toolService = {
  async create(data: CreateToolData): Promise<ApiResponse<Tool>> {
    const response = await api.post<ApiResponse<Tool>>('/tools', data);
    return response.data;
  },

  async getAll(filters?: ToolFilters): Promise<ApiResponse<ToolResponse>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const query = params.toString();
    const url = query ? `/tools?${query}` : '/tools';
    const response = await api.get<ApiResponse<ToolResponse>>(url);
    return response.data;
  },

  async getById(id: number): Promise<ApiResponse<Tool>> {
    const response = await api.get<ApiResponse<Tool>>(`/tools/${id}`);
    return response.data;
  },

  async update(id: number, data: UpdateToolData): Promise<ApiResponse<Tool>> {
    const response = await api.put<ApiResponse<Tool>>(`/tools/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/tools/${id}`);
    return response.data;
  },

  async assign(id: number, data: AssignToolData): Promise<ApiResponse<Tool>> {
    const response = await api.patch<ApiResponse<Tool>>(`/tools/${id}/assign`, data);
    return response.data;
  },

  async unassign(id: number): Promise<ApiResponse<Tool>> {
    const response = await api.patch<ApiResponse<Tool>>(`/tools/${id}/unassign`);
    return response.data;
  },

  async getStats(): Promise<ApiResponse<ToolStats>> {
    const response = await api.get<ApiResponse<ToolStats>>('/tools/stats');
    return response.data;
  },

  async getTypes(): Promise<ApiResponse<ToolTypeOption[]>> {
    const response = await api.get<ApiResponse<ToolTypeOption[]>>('/tools/types');
    return response.data;
  },

  async getStatuses(): Promise<ApiResponse<ToolStatusOption[]>> {
    const response = await api.get<ApiResponse<ToolStatusOption[]>>('/tools/statuses');
    return response.data;
  },
};

