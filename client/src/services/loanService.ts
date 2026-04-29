import api from '../utils/api';
import type {
  ApiResponse,
  EquipmentLoan,
  EquipmentLoanComment,
  EquipmentLoanFilters,
  EquipmentLoanResponse,
  EquipmentLoanSummaryReport,
} from '../types';

export interface LoanRequestItemInput {
  equipment_id: number;
  quantity?: number;
}

export interface CreateLoanRequestData {
  target_incident_area_id: number;
  start_date: string;
  expected_return_date: string;
  request_notes?: string;
  items: LoanRequestItemInput[];
}

export interface LoanChecklistPayload {
  physical_condition?: 'new' | 'good' | 'worn' | 'damaged';
  battery_level?: number;
  accessories?: string;
  observations?: string;
  notes?: string;
}

export interface LoanIncidentPayload {
  loan_item_id: number;
  incident_type: 'damage' | 'loss' | 'missing_accessory' | 'other';
  description: string;
  estimated_cost?: number;
}

export interface ReturnLoanPayload extends LoanChecklistPayload {
  incidents?: LoanIncidentPayload[];
}

export interface PendingLoanChecklistPayload {
  physical_condition?: 'new' | 'good' | 'worn' | 'damaged';
  battery_level?: number;
  observations?: string;
}

export const loanService = {
  async create(data: CreateLoanRequestData): Promise<ApiResponse<EquipmentLoan>> {
    const response = await api.post<ApiResponse<EquipmentLoan>>('/equipment-loans', data);
    return response.data;
  },

  async getAll(filters?: EquipmentLoanFilters): Promise<ApiResponse<EquipmentLoanResponse>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get<ApiResponse<EquipmentLoanResponse>>(
      `/equipment-loans?${params.toString()}`
    );
    return response.data;
  },

  async getById(id: number): Promise<ApiResponse<EquipmentLoan>> {
    const response = await api.get<ApiResponse<EquipmentLoan>>(`/equipment-loans/${id}`);
    return response.data;
  },

  async approve(id: number, notes?: string): Promise<ApiResponse<EquipmentLoan>> {
    const response = await api.patch<ApiResponse<EquipmentLoan>>(`/equipment-loans/${id}/approve`, {
      notes,
    });
    return response.data;
  },

  async reject(id: number, reason: string): Promise<ApiResponse<EquipmentLoan>> {
    const response = await api.patch<ApiResponse<EquipmentLoan>>(`/equipment-loans/${id}/reject`, {
      reason,
    });
    return response.data;
  },

  async deliver(id: number, payload: LoanChecklistPayload): Promise<ApiResponse<EquipmentLoan>> {
    const response = await api.patch<ApiResponse<EquipmentLoan>>(
      `/equipment-loans/${id}/deliver`,
      payload
    );
    return response.data;
  },

  async returnLoan(id: number, payload: ReturnLoanPayload): Promise<ApiResponse<EquipmentLoan>> {
    const response = await api.patch<ApiResponse<EquipmentLoan>>(
      `/equipment-loans/${id}/return`,
      payload
    );
    return response.data;
  },

  async updatePendingChecklist(
    id: number,
    payload: PendingLoanChecklistPayload
  ): Promise<ApiResponse<EquipmentLoan>> {
    const response = await api.patch<ApiResponse<EquipmentLoan>>(
      `/equipment-loans/${id}/pending-checklist`,
      payload
    );
    return response.data;
  },

  async cancel(id: number, notes?: string): Promise<ApiResponse<EquipmentLoan>> {
    const response = await api.patch<ApiResponse<EquipmentLoan>>(`/equipment-loans/${id}/cancel`, {
      notes,
    });
    return response.data;
  },

  async revokeApproval(id: number, notes?: string): Promise<ApiResponse<EquipmentLoan>> {
    const response = await api.patch<ApiResponse<EquipmentLoan>>(
      `/equipment-loans/${id}/revoke-approval`,
      { notes }
    );
    return response.data;
  },

  async getComments(id: number): Promise<ApiResponse<EquipmentLoanComment[]>> {
    const response = await api.get<ApiResponse<EquipmentLoanComment[]>>(
      `/equipment-loans/${id}/comments`
    );
    return response.data;
  },

  async addComment(id: number, commentText: string): Promise<ApiResponse<EquipmentLoanComment>> {
    const response = await api.post<ApiResponse<EquipmentLoanComment>>(
      `/equipment-loans/${id}/comments`,
      { comment_text: commentText }
    );
    return response.data;
  },

  async getSummaryReport(dateFrom: string, dateTo: string): Promise<EquipmentLoanSummaryReport> {
    const response = await api.get<ApiResponse<EquipmentLoanSummaryReport>>(
      '/equipment-loans/reports/summary',
      {
        params: { date_from: dateFrom, date_to: dateTo },
      }
    );
    if (!response.data.success || response.data.data === undefined) {
      throw new Error(response.data.message || 'No se pudo cargar el reporte de préstamos');
    }
    return response.data.data;
  },
};
