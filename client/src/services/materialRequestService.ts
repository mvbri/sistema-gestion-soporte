import api from '../utils/api';
import type {
  ApiResponse,
  MaterialRequest,
  MaterialRequestComment,
  MaterialRequestFilters,
  MaterialRequestResponse,
  MaterialType,
} from '../types';

export interface MaterialRequestItemInput {
  source_mode: 'manual';
  material_type: MaterialType;
  custom_material_name: string;
  custom_material_description?: string;
  quantity: number;
}

export interface CreateMaterialRequestData {
  addressee_name: string;
  addressee_title: string;
  addressee_addressing_text: string;
  request_notes?: string;
  items: MaterialRequestItemInput[];
}

export const materialRequestService = {
  async create(data: CreateMaterialRequestData): Promise<ApiResponse<MaterialRequest>> {
    const response = await api.post<ApiResponse<MaterialRequest>>('/material-requests', data);
    return response.data;
  },

  async getAll(filters?: MaterialRequestFilters): Promise<ApiResponse<MaterialRequestResponse>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get<ApiResponse<MaterialRequestResponse>>(
      `/material-requests?${params.toString()}`
    );
    return response.data;
  },

  async getById(id: number): Promise<ApiResponse<MaterialRequest>> {
    const response = await api.get<ApiResponse<MaterialRequest>>(`/material-requests/${id}`);
    return response.data;
  },

  async approve(id: number, notes?: string): Promise<ApiResponse<MaterialRequest>> {
    const response = await api.patch<ApiResponse<MaterialRequest>>(`/material-requests/${id}/approve`, {
      notes,
    });
    return response.data;
  },

  async reject(id: number, reason: string): Promise<ApiResponse<MaterialRequest>> {
    const response = await api.patch<ApiResponse<MaterialRequest>>(`/material-requests/${id}/reject`, {
      reason,
    });
    return response.data;
  },

  async cancel(id: number, notes?: string): Promise<ApiResponse<MaterialRequest>> {
    const response = await api.patch<ApiResponse<MaterialRequest>>(`/material-requests/${id}/cancel`, {
      notes,
    });
    return response.data;
  },

  async getComments(id: number): Promise<ApiResponse<MaterialRequestComment[]>> {
    const response = await api.get<ApiResponse<MaterialRequestComment[]>>(`/material-requests/${id}/comments`);
    return response.data;
  },

  async addComment(id: number, commentText: string): Promise<ApiResponse<MaterialRequestComment>> {
    const response = await api.post<ApiResponse<MaterialRequestComment>>(
      `/material-requests/${id}/comments`,
      {
        comment_text: commentText,
      }
    );
    return response.data;
  },

  async getPdfData(id: number): Promise<ApiResponse<MaterialRequest>> {
    const response = await api.get<ApiResponse<MaterialRequest>>(`/material-requests/${id}/pdf`);
    return response.data;
  },
};
