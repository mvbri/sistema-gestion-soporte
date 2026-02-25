import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useTickets, useEstados, useCategorias, usePrioridades, useTecnicos, useDeleteTicket } from '../hooks/useTickets';
import type { Ticket, TicketFilters } from '../types';
import { StatusBadge } from '../components/tickets/StatusBadge';
import { PriorityBadge } from '../components/tickets/PriorityBadge';
import { CategoryBadge } from '../components/tickets/CategoryBadge';
import { ConfirmDeleteModal } from '../components/tickets/ConfirmDeleteModal';

export const TicketsList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initialFilters: TicketFilters = {
    page: 1,
    limit: 10,
  };
  const [filters, setFilters] = useState<TicketFilters>(initialFilters);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; ticket: Ticket | null }>({
    isOpen: false,
    ticket: null,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { data: ticketsData, isLoading: loadingTickets } = useTickets(filters);
  const { data: estados = [] } = useEstados();
  const { data: categorias = [] } = useCategorias();
  const { data: prioridades = [] } = usePrioridades();
  const { data: tecnicos = [] } = useTecnicos();
  const deleteTicketMutation = useDeleteTicket();

  const tickets = ticketsData?.tickets || [];
  const pagination = ticketsData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
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
    deleteTicketMutation.mutate(deleteModal.ticket.id, {
      onSuccess: () => {
        setDeleteModal({ isOpen: false, ticket: null });
      },
    });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Fecha no disponible';

    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canEdit = user?.role === 'administrator';
  const canDelete = user?.role === 'administrator';

  return (
    <>
      <MainNavbar />
      <PageWrapper>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Tickets</h1>
              {user?.role === 'end_user' && (
                <p className="mt-1 text-sm text-gray-600">Solo puedes ver tus propios tickets</p>
              )}
              {user?.role === 'technician' && (
                <p className="mt-1 text-sm text-gray-600">Puedes ver todos los tickets del sistema</p>
              )}
            </div>
            {user?.role === 'end_user' && (
              <button
                onClick={() => navigate('/tickets/crear')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Crear Ticket
              </button>
            )}
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-6 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">Filtros de Búsqueda</h2>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow"
                aria-label="Limpiar todos los filtros"
                title="Limpiar filtros"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Limpiar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
              <div className="min-w-0">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>Buscar</span>
                </label>
                <div className="flex min-w-0 shadow-sm">
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
                    className="flex-1 min-w-0 px-4 py-2.5 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-r-lg hover:from-blue-700 hover:to-blue-800 flex-shrink-0 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="min-w-0">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Estado</span>
                </label>
                <div className="relative">
                  <select
                    value={filters.estado_id || ''}
                    onChange={(e) => handleFilterChange('estado_id', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full min-w-0 px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white shadow-sm hover:shadow-md appearance-none cursor-pointer"
                  >
                    <option value="">Todos</option>
                    {estados.map((estado) => (
                      <option key={estado.id} value={estado.id}>
                        {estado.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg
                    className="w-4 h-4 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <span>Categoría</span>
                </label>
                <div className="relative">
                  <select
                    value={filters.categoria_id || ''}
                    onChange={(e) => handleFilterChange('categoria_id', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full min-w-0 px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white shadow-sm hover:shadow-md appearance-none cursor-pointer"
                  >
                    <option value="">Todas</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <svg
                    className="w-4 h-4 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Prioridad</span>
                </label>
                <div className="relative">
                  <select
                    value={filters.prioridad_id || ''}
                    onChange={(e) => handleFilterChange('prioridad_id', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full min-w-0 px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white shadow-sm hover:shadow-md appearance-none cursor-pointer"
                  >
                    <option value="">Todas</option>
                    {prioridades.map((prioridad) => (
                      <option key={prioridad.id} value={prioridad.id}>
                        {prioridad.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {(user?.role === 'administrator' || user?.role === 'technician') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="min-w-0">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                    <svg
                      className="w-4 h-4 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>Técnico Asignado</span>
                  </label>
                  <div className="relative">
                    <select
                      value={filters.assigned_technician_id || ''}
                      onChange={(e) => handleFilterChange('assigned_technician_id', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full min-w-0 px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white shadow-sm hover:shadow-md appearance-none cursor-pointer"
                    >
                      <option value="">Todos</option>
                      {tecnicos.map((tecnico) => (
                        <option key={tecnico.id} value={tecnico.id}>
                          {tecnico.full_name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {loadingTickets ? (
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
                              {ticket.title}
                            </p>
                            <StatusBadge
                              estado={ticket.state_name || ''}
                              colorOverride={ticket.state_color}
                            />
                            <PriorityBadge
                              prioridad={ticket.priority_name || ''}
                              colorOverride={ticket.priority_color}
                            />
                            <CategoryBadge categoria={ticket.category_name || ''} />
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>ID: {ticket.id.substring(0, 8)}...</span>
                            <span>Creado: {formatDate(ticket.created_at)}</span>
                            {ticket.closed_at && (
                              <span>Cerrado: {formatDate(ticket.closed_at)}</span>
                            )}
                            <span>Por: {ticket.created_by_user_name || 'N/A'}</span>
                            {ticket.assigned_technician_name && (
                              <span>Asignado a: {ticket.assigned_technician_name}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/tickets/${ticket.id}`)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out"
                          >
                            Ver
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => navigate(`/tickets/${ticket.id}/editar`)}
                              className="group p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center"
                              title="Editar"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, ticket })}
                              className="group p-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center"
                              title="Eliminar"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
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
        ticketTitulo={deleteModal.ticket?.title || ''}
      />
      </PageWrapper>
    </>
  );
};
