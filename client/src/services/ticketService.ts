import api from '../utils/api';
import type { ApiResponse, Ticket, TicketComentario, TicketHistorial, EstadoTicket, CategoriaTicket, PrioridadTicket, DireccionTicket, Tecnico, TicketStats, TicketFilters } from '../types';

export interface CreateTicketData {
  titulo: string;
  descripcion: string;
  categoria_id: number;
  prioridad_id: number;
  imagen_url?: string;
  equipment_ids?: number[];
}

export interface UpdateTicketData {
  titulo?: string;
  descripcion?: string;
  categoria_id?: number;
  prioridad_id?: number;
  estado_id?: number;
  tecnico_asignado_id?: number | null;
  equipment_ids?: number[];
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
      const paramMapping: Record<string, string> = {
        estado_id: 'state_id',
        categoria_id: 'category_id',
        prioridad_id: 'priority_id',
        assigned_technician_id: 'assigned_technician_id',
        busqueda: 'search',
        fecha_desde: 'date_from',
        fecha_hasta: 'date_to',
      };

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          const backendKey = paramMapping[key] || key;
          params.append(backendKey, String(value));
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
    const mappedData: Record<string, unknown> = {};
    
    if (data.titulo !== undefined) mappedData.title = data.titulo;
    if (data.descripcion !== undefined) mappedData.description = data.descripcion;
    if (data.categoria_id !== undefined) mappedData.category_id = data.categoria_id;
    if (data.prioridad_id !== undefined) mappedData.priority_id = data.prioridad_id;
    if (data.estado_id !== undefined) mappedData.state_id = data.estado_id;
    if (data.tecnico_asignado_id !== undefined) {
      if (data.tecnico_asignado_id === null) {
        mappedData.assigned_technician_id = null;
      } else if (typeof data.tecnico_asignado_id === 'number' && !isNaN(data.tecnico_asignado_id)) {
        mappedData.assigned_technician_id = data.tecnico_asignado_id;
      }
    }
    if (data.equipment_ids !== undefined) {
      mappedData.equipment_ids = data.equipment_ids;
    }
    
    const response = await api.put<ApiResponse<Ticket>>(`/tickets/${id}`, mappedData);
    return response.data;
  },

  async delete(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/tickets/${id}`);
    return response.data;
  },

  async addComment(id: string, data: CommentData): Promise<ApiResponse<TicketComentario>> {
    const response = await api.post<ApiResponse<TicketComentario>>(`/tickets/${id}/comentarios`, {
      content: data.contenido
    });
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

  async getDirecciones(): Promise<ApiResponse<DireccionTicket[]>> {
    const response = await api.get<ApiResponse<DireccionTicket[]>>('/tickets/direcciones');
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

  async startProgress(id: string): Promise<ApiResponse<Ticket>> {
    const response = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}/iniciar-progreso`);
    return response.data;
  },

  async markAsResolved(id: string): Promise<ApiResponse<Ticket>> {
    const response = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}/marcar-resuelto`);
    return response.data;
  },
};
