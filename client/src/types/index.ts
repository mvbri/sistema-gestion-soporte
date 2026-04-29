export interface User {
  id: number;
  full_name: string;
  email: string;
  role: 'administrator' | 'technician' | 'end_user';
  phone?: string;
  department?: string;
  incident_area_id?: number | null;
  email_verified: boolean;
  active?: boolean;
  created_at?: string;
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

export interface FrequentIssue {
  id: number;
  title: string;
  symptoms?: string | null;
  possible_solution: string;
  category_id?: number | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
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
  period?: {
    date_from: string;
    date_to: string;
  };
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
  porDireccion: Array<{
    id: number;
    nombre: string;
    cantidad: number;
  }>;
  total: number;
}

/** Reporte de tickets por rango de fechas (solo administración). */
export interface TicketsPeriodReport {
  period: {
    date_from: string;
    date_to: string;
  };
  tickets_creados: number;
  tickets_cerrados: number;
  promedio_horas_resolucion: number | null;
  porEstado: TicketStats['porEstado'];
  porCategoria: TicketStats['porCategoria'];
  porPrioridad: TicketStats['porPrioridad'];
  porArea: Array<{
    id: number;
    nombre: string;
    cantidad: number;
  }>;
  cierresPorTecnico: Array<{
    tecnico_id: number;
    tecnico_nombre: string;
    cantidad: number;
  }>;
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

export interface EquipmentPool {
  id: number;
  name: string;
  description?: string | null;
  total_stock: number;
  available_stock: number;
  minimum_stock: number;
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

export type LoanStatus =
  | 'pending'
  | 'approved'
  | 'delivered'
  | 'returned'
  | 'rejected'
  | 'overdue'
  | 'cancelled';

export interface EquipmentLoanItem {
  id: number;
  loan_id: number;
  equipment_id?: number | null;
  equipment_name?: string | null;
  equipment_serial_number?: string | null;
  pool_id?: number | null;
  pool_name?: string | null;
  quantity: number;
}

export interface EquipmentLoanChecklist {
  id: number;
  loan_item_id: number;
  checklist_type: 'delivery' | 'return';
  battery_level?: number | null;
  physical_condition: 'new' | 'good' | 'worn' | 'damaged';
  accessories?: string | null;
  observations?: string | null;
  created_by_user_id: number;
  created_by_user_name?: string;
  created_at: string;
}

export interface EquipmentLoanIncident {
  id: number;
  loan_item_id: number;
  incident_type: 'damage' | 'loss' | 'missing_accessory' | 'other';
  description: string;
  estimated_cost?: number | null;
  reported_by_user_id: number;
  reported_by_user_name?: string;
  created_at: string;
}

export interface EquipmentLoanHistory {
  id: number;
  loan_id: number;
  changed_by_user_id: number;
  changed_by_user_name?: string;
  previous_status?: LoanStatus | null;
  new_status: LoanStatus;
  notes?: string | null;
  created_at: string;
}

export interface EquipmentLoan {
  id: number;
  request_code?: string;
  requester_user_id: number;
  requester_name: string;
  requester_email?: string;
  target_incident_area_id?: number | null;
  target_incident_area_name?: string | null;
  approved_by_user_id?: number | null;
  approved_by_user_name?: string | null;
  status: LoanStatus;
  request_notes?: string | null;
  pending_physical_condition?: 'new' | 'good' | 'worn' | 'damaged' | null;
  pending_battery_level?: number | null;
  pending_observations?: string | null;
  approval_notes?: string | null;
  rejection_reason?: string | null;
  start_date: string;
  expected_return_date: string;
  delivered_at?: string | null;
  returned_at?: string | null;
  items: EquipmentLoanItem[];
  checklists: EquipmentLoanChecklist[];
  incidents: EquipmentLoanIncident[];
  history: EquipmentLoanHistory[];
  created_at: string;
}

export interface EquipmentLoanListItem {
  id: number;
  request_code?: string;
  requester_user_id: number;
  requester_name: string;
  target_incident_area_name?: string | null;
  status: LoanStatus;
  start_date: string;
  expected_return_date: string;
  created_at: string;
  items_count: number;
}

export interface EquipmentLoanFilters {
  status?: LoanStatus;
  search?: string;
  date_from?: string;
  date_to?: string;
  requester_user_id?: number;
  page?: number;
  limit?: number;
}

export interface EquipmentLoanResponse {
  loans: EquipmentLoanListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface EquipmentLoanSummaryReport {
  period: {
    date_from: string;
    date_to: string;
  };
  totals: {
    total_requests: number;
    approved_count: number;
    returned_count: number;
    overdue_count: number;
  };
  byStatus: Array<{
    status: LoanStatus;
    count: number;
  }>;
  topRequesters: Array<{
    user_id: number;
    user_name: string;
    count: number;
  }>;
  incidents: Array<{
    incident_type: string;
    count: number;
  }>;
}

export type MaterialRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type MaterialType = 'equipment' | 'consumable' | 'tool';

export interface MaterialRequestItem {
  id: number;
  material_request_id: number;
  material_type: MaterialType | 'manual';
  source_mode?: 'catalog' | 'manual';
  reference_id?: number | null;
  custom_material_name?: string | null;
  custom_material_description?: string | null;
  quantity: number;
  material_name?: string | null;
  equipment_serial_number?: string | null;
  tool_code?: string | null;
  consumable_unit?: string | null;
  consumable_available_quantity?: number | null;
}

export interface MaterialRequestHistory {
  id: number;
  material_request_id: number;
  changed_by_user_id: number;
  changed_by_user_name?: string;
  previous_status?: MaterialRequestStatus | null;
  new_status: MaterialRequestStatus;
  notes?: string | null;
  created_at: string;
}

export interface MaterialRequestComment {
  id: number;
  material_request_id: number;
  comment_text: string;
  created_by_user_id: number;
  created_by_user_name?: string;
  created_by_user_role?: Role;
  created_at: string;
}

export interface MaterialRequest {
  id: number;
  request_code?: string;
  requester_user_id: number;
  requester_name: string;
  requester_email?: string;
  /** Nombre de la persona a quien va dirigida la solicitud. */
  addressee_name?: string | null;
  /** Cargo o denominación del destinatario. */
  addressee_title?: string | null;
  /** Texto al destinatario: dependencia de su cargo y motivo de la solicitud de materiales. */
  addressee_addressing_text?: string | null;
  approved_by_user_id?: number | null;
  approved_by_user_name?: string | null;
  status: MaterialRequestStatus;
  request_notes?: string | null;
  approval_notes?: string | null;
  rejection_reason?: string | null;
  cancelled_notes?: string | null;
  created_at: string;
  items: MaterialRequestItem[];
  history: MaterialRequestHistory[];
  comments: MaterialRequestComment[];
}

export interface MaterialRequestListItem {
  id: number;
  request_code?: string;
  requester_user_id: number;
  requester_name: string;
  status: MaterialRequestStatus;
  request_notes?: string | null;
  created_at: string;
  items_count: number;
}

export interface MaterialRequestFilters {
  status?: MaterialRequestStatus;
  search?: string;
  date_from?: string;
  date_to?: string;
  requester_user_id?: number;
  page?: number;
  limit?: number;
}

export interface MaterialRequestResponse {
  requests: MaterialRequestListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}