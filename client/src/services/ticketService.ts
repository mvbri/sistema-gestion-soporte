import api from '../utils/api';
import type { ApiResponse, Ticket, TicketComentario, TicketHistorial, EstadoTicket, CategoriaTicket, PrioridadTicket, Tecnico, TicketStats, TicketFilters } from '../types';

export interface CreateTicketData {
  titulo: string;
  descripcion: string;
  area_incidente: string;
  categoria_id: number;
  prioridad_id: number;
  imagen_url?: string;
}

export interface UpdateTicketData {
  titulo?: string;
  descripcion?: string;
  area_incidente?: string;
  categoria_id?: number;
  prioridad_id?: number;
  estado_id?: number;
  tecnico_asignado_id?: number | null;
}

export interface CommentData {
  contenido: string;
}

export interface TicketsResponse {
  tickets: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TicketDetailResponse {
  ticket: Ticket;
  comentarios: TicketComentario[];
  historial: TicketHistorial[];
}

export const ticketService = {
  async create(data: CreateTicketData): Promise<ApiResponse<Ticket>> {
    const response = await api.post<ApiResponse<Ticket>>('/tickets', data);
    return response.data;
  },

  async createWithFormData(formData: FormData): Promise<ApiResponse<Ticket>> {
    const response = await api.post<ApiResponse<Ticket>>('/tickets', formData);
    return response.data;
  },

  async getAll(filters?: TicketFilters): Promise<ApiResponse<TicketsResponse>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const response = await api.get<ApiResponse<TicketsResponse>>(`/tickets?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<ApiResponse<TicketDetailResponse>> {
    const response = await api.get<ApiResponse<TicketDetailResponse>>(`/tickets/${id}`);
    return response.data;
  },

  async update(id: string, data: UpdateTicketData): Promise<ApiResponse<Ticket>> {
    const response = await api.put<ApiResponse<Ticket>>(`/tickets/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/tickets/${id}`);
    return response.data;
  },

  async addComment(id: string, data: CommentData): Promise<ApiResponse<TicketComentario>> {
    const response = await api.post<ApiResponse<TicketComentario>>(`/tickets/${id}/comentarios`, data);
    return response.data;
  },

  async getEstados(): Promise<ApiResponse<EstadoTicket[]>> {
    const response = await api.get<ApiResponse<EstadoTicket[]>>('/tickets/estados');
    return response.data;
  },

  async getCategorias(): Promise<ApiResponse<CategoriaTicket[]>> {
    const response = await api.get<ApiResponse<CategoriaTicket[]>>('/tickets/categorias');
    return response.data;
  },

  async getPrioridades(): Promise<ApiResponse<PrioridadTicket[]>> {
    const response = await api.get<ApiResponse<PrioridadTicket[]>>('/tickets/prioridades');
    return response.data;
  },

  async getTecnicos(): Promise<ApiResponse<Tecnico[]>> {
    const response = await api.get<ApiResponse<Tecnico[]>>('/tickets/tecnicos');
    return response.data;
  },

  async getStats(): Promise<ApiResponse<TicketStats>> {
    const response = await api.get<ApiResponse<TicketStats>>('/tickets/stats');
    return response.data;
  },
};
