export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'administrator' | 'technician' | 'end_user';
  phone?: string;
  department?: string;
  incident_area_id?: number | null;
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

export interface AxiosErrorResponse {
  response?: {
    data?: {
      message?: string;
      errors?: Array<{ msg?: string; message?: string; param?: string }>;
    };
    status?: number;
  };
  message?: string;
}

export type Role = 'administrator' | 'technician' | 'end_user';

export interface EstadoTicket {
  id: number;
  name: string;
  description?: string;
  color: string;
  order: number;
  active: boolean;
}

export interface CategoriaTicket {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface PrioridadTicket {
  id: number;
  name: string;
  level: number;
  color: string;
  description?: string;
  active: boolean;
}

export interface DireccionTicket {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  incident_area_id: number;
  incident_area_name?: string;
  category_id: number;
  category_name?: string;
  priority_id: number;
  priority_name?: string;
  priority_color?: string;
  priority_level?: number;
  state_id: number;
  state_name?: string;
  state_color?: string;
  created_by_user_id: number;
  created_by_user_name?: string;
  created_by_user_email?: string;
  assigned_technician_id?: number | null;
  assigned_technician_name?: string | null;
  assigned_technician_email?: string | null;
  image_url?: string | null;
  images?: string[];
  created_at: string;
  updated_at: string;
  closed_at?: string | null;
  // Campos legacy en español para compatibilidad (deprecated)
  titulo?: string;
  descripcion?: string;
  area_incidente_nombre?: string;
  categoria_id?: number;
  categoria_nombre?: string;
  prioridad_id?: number;
  prioridad_nombre?: string;
  prioridad_color?: string;
  prioridad_nivel?: number;
  estado_id?: number;
  estado_nombre?: string;
  estado_color?: string;
  usuario_creador_id?: number;
  usuario_creador_nombre?: string;
  usuario_creador_email?: string;
  tecnico_asignado_id?: number | null;
  tecnico_asignado_nombre?: string | null;
  tecnico_asignado_email?: string | null;
  imagen_url?: string | null;
  imagenes?: string[];
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  fecha_cierre?: string | null;
  equipment?: Equipment[];
  equipment_ids?: number[];
}

export interface TicketComentario {
  id: number;
  ticket_id: string;
  user_id: number;
  user_name: string;
  user_email: string;
  user_role: string;
  content: string;
  created_at: string;
}

export interface TicketHistorial {
  id: number;
  ticket_id: string;
  user_id: number;
  user_name: string;
  user_email: string;
  change_type: string;
  previous_field?: string | null;
  new_field?: string | null;
  description?: string | null;
  changed_at: string;
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
  assigned_technician_id?: number;
  busqueda?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
}

export interface EquipmentType {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ConsumableType {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type EquipmentStatus = 'available' | 'assigned' | 'maintenance' | 'retired';

export interface Equipment {
  id: number;
  name: string;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  type_id?: number;
  type?: string | null;
  type_name?: string | null;
  type_description?: string | null;
  status: EquipmentStatus;
  location?: string | null;
  assigned_to_user_id?: number | null;
  assigned_to_user_name?: string | null;
  assigned_to_user_email?: string | null;
  description?: string | null;
  purchase_date?: string | null;
  warranty_expires_at?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EquipmentTypeOption {
  value: string;
  label: string;
  id?: number;
  description?: string;
}

export interface EquipmentStatusOption {
  value: EquipmentStatus;
  label: string;
  color: string;
}

export interface EquipmentFilters {
  status?: EquipmentStatus;
  type?: string | number;
  assigned_to_user_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EquipmentStats {
  byStatus: Array<{
    status: EquipmentStatus;
    count: number;
  }>;
  byType: Array<{
    type: string;
    count: number;
  }>;
  total: number;
}

export interface EquipmentResponse {
  equipment: Equipment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ConsumableStatus = 'available' | 'low_stock' | 'out_of_stock' | 'inactive';

export interface Consumable {
  id: number;
  name: string;
  type_id: number;
  type_name?: string | null;
  type_description?: string | null;
  unit: string;
  quantity: number;
  minimum_quantity: number;
  status: ConsumableStatus;
  location?: string | null;
  description?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConsumableTypeOption {
  value: string;
  label: string;
  id?: number;
  description?: string;
}

export interface ConsumableStatusOption {
  value: ConsumableStatus;
  label: string;
  color: string;
}

export interface ConsumableFilters {
  status?: ConsumableStatus;
  type?: string | number;
  search?: string;
  below_minimum?: boolean;
  page?: number;
  limit?: number;
}

export interface ConsumableStats {
  byStatus: Array<{
    status: ConsumableStatus;
    count: number;
  }>;
  byType: Array<{
    type: string;
    count: number;
  }>;
  total: number;
}

export interface ConsumableResponse {
  consumables: Consumable[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ToolStatus = 'available' | 'assigned' | 'maintenance' | 'lost' | 'retired';

export interface ToolType {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Tool {
  id: number;
  name: string;
  code?: string | null;
  type_id?: number;
  type?: string | null;
  type_name?: string | null;
  type_description?: string | null;
  status: ToolStatus;
  condition: 'new' | 'good' | 'worn' | 'broken';
  location?: string | null;
  assigned_to_user_id?: number | null;
  assigned_to_user_name?: string | null;
  assigned_to_user_email?: string | null;
  description?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ToolTypeOption {
  value: string;
  label: string;
  id?: number;
  description?: string;
}

export interface ToolStatusOption {
  value: ToolStatus;
  label: string;
  color: string;
}

export interface ToolFilters {
  status?: ToolStatus;
  type?: string | number;
  assigned_to_user_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ToolStats {
  byStatus: Array<{
    status: ToolStatus;
    count: number;
  }>;
  byType: Array<{
    type: string;
    count: number;
  }>;
  total: number;
}

export interface ToolResponse {
  tools: Tool[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}