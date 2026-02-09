export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'administrator' | 'technician' | 'end_user';
  phone?: string;
  department?: string;
  email_verified: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ msg: string; param: string }>;
}

export type Role = 'administrator' | 'technician' | 'end_user';

export interface EstadoTicket {
  id: number;
  nombre: string;
  descripcion?: string;
  color: string;
  orden: number;
  activo: boolean;
}

export interface CategoriaTicket {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}export interface PrioridadTicket {
  id: number;
  nombre: string;
  nivel: number;
  color: string;
  descripcion?: string;
  activo: boolean;
}

export interface Ticket {
  id: string;
  titulo: string;
  descripcion: string;
  area_incidente: string;
  categoria_id: number;
  categoria_nombre?: string;
  prioridad_id: number;
  prioridad_nombre?: string;
  prioridad_color?: string;
  prioridad_nivel?: number;
  estado_id: number;
  estado_nombre?: string;
  estado_color?: string;
  usuario_creador_id: number;
  usuario_creador_nombre?: string;
  usuario_creador_email?: string;
  tecnico_asignado_id?: number | null;
  tecnico_asignado_nombre?: string | null;
  tecnico_asignado_email?: string | null;
  imagen_url?: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_cierre?: string | null;
}

export interface TicketComentario {
  id: number;
  ticket_id: string;
  usuario_id: number;
  usuario_nombre: string;
  usuario_email: string;
  usuario_rol: string;
  contenido: string;
  fecha_creacion: string;
}

export interface TicketHistorial {
  id: number;
  ticket_id: string;
  usuario_id: number;
  usuario_nombre: string;
  usuario_email: string;
  tipo_cambio: string;
  campo_anterior?: string | null;
  campo_nuevo?: string | null;
  descripcion?: string | null;
  fecha_cambio: string;
}

export interface Tecnico {
  id: number;
  full_name: string;
  email: string;
  department?: string;
}

export interface TicketStats {
  porEstado: Array<{
    estado_id: number;
    estado_nombre: string;
    estado_color: string;
    cantidad: number;
  }>;
  porCategoria: Array<{
    id: number;
    nombre: string;
    cantidad: number;
  }>;
  porPrioridad: Array<{
    id: number;
    nombre: string;
    color: string;
    cantidad: number;
  }>;
  total: number;
}

export interface TicketFilters {
  estado_id?: number;
  categoria_id?: number;
  prioridad_id?: number;
  tecnico_asignado_id?: number;
  busqueda?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
}
