import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ticketService } from '../services/ticketService';
import type { Ticket, EstadoTicket, CategoriaTicket, PrioridadTicket, Tecnico, TicketFilters } from '../types';
import { StatusBadge } from '../components/tickets/StatusBadge';
import { PriorityBadge } from '../components/tickets/PriorityBadge';
import { CategoryBadge } from '../components/tickets/CategoryBadge';
import { ConfirmDeleteModal } from '../components/tickets/ConfirmDeleteModal';
import { toast } from 'react-toastify';

export const TicketsList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const initialFilters: TicketFilters = {
    page: 1,
    limit: 10,
  };
  const [estados, setEstados] = useState<EstadoTicket[]>([]);
  const [categorias, setCategorias] = useState<CategoriaTicket[]>([]);
  const [prioridades, setPrioridades] = useState<PrioridadTicket[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [filters, setFilters] = useState<TicketFilters>(initialFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; ticket: Ticket | null }>({
    isOpen: false,
    ticket: null,
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, estadosRes, categoriasRes, prioridadesRes] = await Promise.all([
        ticketService.getAll(filters),
        ticketService.getEstados(),
        ticketService.getCategorias(),
        ticketService.getPrioridades(),
      ]);

      if (ticketsRes.success && ticketsRes.data) {
        setTickets(ticketsRes.data.tickets);
        setPagination(ticketsRes.data.pagination);
      }

      if (estadosRes.success && estadosRes.data) setEstados(estadosRes.data);
      if (categoriasRes.success && categoriasRes.data) setCategorias(categoriasRes.data);
      if (prioridadesRes.success && prioridadesRes.data) setPrioridades(prioridadesRes.data);

      if (user?.role === 'administrator' || user?.role === 'technician') {
        const tecnicosRes = await ticketService.getTecnicos();
        if (tecnicosRes.success && tecnicosRes.data) setTecnicos(tecnicosRes.data);
      }
    } catch (error) {
      toast.error('Error al cargar tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof TicketFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, busqueda: searchTerm || undefined, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters(initialFilters);
  };

  const handleDelete = async () => {
    if (!deleteModal.ticket) return;

    try {
      const response = await ticketService.delete(deleteModal.ticket.id);
      if (response.success) {
        toast.success('Ticket eliminado exitosamente');
        setDeleteModal({ isOpen: false, ticket: null });
        loadData();
      }
    } catch (error) {
      toast.error('Error al eliminar ticket');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canEdit = user?.role === 'administrator' || user?.role === 'technician';
  const canDelete = user?.role === 'administrator';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Tickets</h1>
            {user?.role === 'end_user' && (
              <button
                onClick={() => navigate('/tickets/crear')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Crear Ticket
              </button>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={handleClearFilters}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                aria-label="Limpiar todos los filtros"
                title="Limpiar filtros"
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 4h16l-6 7v5.5a1 1 0 0 1-.4.8l-3 2.25V11L4 4z" />
                  <path d="M15 15l4 4m0-4l-4 4" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                <div className="flex">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTerm(value);

                      if (value === '') {
                        setFilters((prev) => ({ ...prev, busqueda: undefined, page: 1 }));
                      }
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Título o descripción..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  >
                    Buscar
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={filters.estado_id || ''}
                  onChange={(e) => handleFilterChange('estado_id', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {estados.map((estado) => (
                    <option key={estado.id} value={estado.id}>
                      {estado.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={filters.categoria_id || ''}
                  onChange={(e) => handleFilterChange('categoria_id', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select
                  value={filters.prioridad_id || ''}
                  onChange={(e) => handleFilterChange('prioridad_id', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  {prioridades.map((prioridad) => (
                    <option key={prioridad.id} value={prioridad.id}>
                      {prioridad.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(user?.role === 'administrator' || user?.role === 'technician') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Técnico Asignado</label>
                  <select
                    value={filters.tecnico_asignado_id || ''}
                    onChange={(e) => handleFilterChange('tecnico_asignado_id', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    {tecnicos.map((tecnico) => (
                      <option key={tecnico.id} value={tecnico.id}>
                        {tecnico.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500">No se encontraron tickets</p>
            </div>
          ) : (
            <>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <li key={ticket.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {ticket.titulo}
                            </p>
                            <StatusBadge
                              estado={ticket.estado_nombre || ''}
                              colorOverride={ticket.estado_color}
                            />
                            <PriorityBadge
                              prioridad={ticket.prioridad_nombre || ''}
                              colorOverride={ticket.prioridad_color}
                            />
                            <CategoryBadge categoria={ticket.categoria_nombre || ''} />
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>ID: {ticket.id.substring(0, 8)}...</span>
                            <span>Creado: {formatDate(ticket.fecha_creacion)}</span>
                            {ticket.fecha_cierre && (
                              <span>Cerrado: {formatDate(ticket.fecha_cierre)}</span>
                            )}
                            <span>Por: {ticket.usuario_creador_nombre}</span>
                            {ticket.tecnico_asignado_nombre && (
                              <span>Asignado a: {ticket.tecnico_asignado_nombre}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/tickets/${ticket.id}`)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Ver
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => navigate(`/tickets/${ticket.id}/editar`)}
                              className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                            >
                              Editar
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, ticket })}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} tickets
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, ticket: null })}
        onConfirm={handleDelete}
        ticketTitulo={deleteModal.ticket?.titulo || ''}
      />
    </div>
  );
};
