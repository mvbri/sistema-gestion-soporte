import api from '../utils/api';
import type { ApiResponse } from '../types';

export interface BackupFile {
  filename: string;
  size: number;
  created_at: string;
  modified_at: string;
}

export interface BackupListResponse {
  backups: BackupFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BackupListFilters {
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: 'filename' | 'size' | 'created_at';
  orderDirection?: 'ASC' | 'DESC';
}

export const backupService = {
  async listBackups(filters?: BackupListFilters): Promise<ApiResponse<BackupListResponse>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.orderBy) params.append('orderBy', filters.orderBy);
      if (filters.orderDirection) params.append('orderDirection', filters.orderDirection);
    }
    const queryString = params.toString();
    const url = `/admin/backup/list${queryString ? `?${queryString}` : ''}`;
    const response = await api.get<ApiResponse<BackupListResponse>>(url);
    return response.data;
  },

  async generateBackup(): Promise<Blob> {
    const response = await api.get('/admin/backup/generate', {
      responseType: 'blob',
    });
    return response.data;
  },

  async downloadBackup(filename: string): Promise<Blob> {
    const response = await api.get(`/admin/backup/download/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async restoreBackup(file: File): Promise<ApiResponse<{ filename: string; size: number }>> {
    const formData = new FormData();
    formData.append('backupFile', file);
    
    const response = await api.post<ApiResponse<{ filename: string; size: number }>>(
      '/admin/backup/restore',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async restoreBackupFromFile(filename: string): Promise<ApiResponse<{ filename: string; size: number }>> {
    const response = await api.post<ApiResponse<{ filename: string; size: number }>>(
      '/admin/backup/restore-file',
      { filename }
    );
    return response.data;
  },
};
