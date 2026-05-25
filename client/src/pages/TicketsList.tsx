import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import {
  useTickets,
  useEstados,
  useCategorias,
  usePrioridades,
  useTecnicos,
  useDeleteTicket,
  useMarkAsResolved,
} from '../hooks/useTickets';
import type { Ticket, TicketFilters } from '../types';
import { StatusBadge } from '../components/tickets/StatusBadge';
import { PriorityBadge } from '../components/tickets/PriorityBadge';
import { CategoryBadge } from '../components/tickets/CategoryBadge';
import { ConfirmDeleteModal } from '../components/tickets/ConfirmDeleteModal';
import { ClearFiltersIcon } from '../components/icons/ClearFiltersIcon';

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

  const isTechnician = user?.role === 'technician';

  const { data: ticketsData, isLoading: loadingTickets } = useTickets(filters);
  const { data: createdByMeData, isLoading: loadingCreatedByMe } = useTickets(
    { scope: 'created_by_me', page: 1, limit: 8 },
    { enabled: isTechnician }
  );
  const { data: estados = [] } = useEstados();
  const { data: categorias = [] } = useCategorias();
  const { data: prioridades = [] } = usePrioridades();
  const { data: tecnicos = [] } = useTecnicos();
  const deleteTicketMutation = useDeleteTicket();
  const markAsResolvedMutation = useMarkAsResolved();

  const tickets = ticketsData?.tickets || [];
  const createdByMeTickets = createdByMeData?.tickets || [];
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

  const endUserCanMarkResolved = (ticket: Ticket) =>
    Boolean(
      user &&
        user.role === 'end_user' &&
        user.id === ticket.created_by_user_id &&
        (ticket.state_id === 2 || ticket.state_id === 3)
    );

  const isMarkingResolved = (ticketId: string) =>
    markAsResolvedMutation.isPending && markAsResolvedMutation.variables === ticketId;

  return (
    <>
      <MainNavbar />
      <PageWrapper>
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="page-heading">
                {user?.role === 'end_user' ? 'Mis tickets' : 'Gestión de Tickets'}
              </h1>
              {user?.role === 'end_user' && (
                <p className="page-subheading">Solo puedes ver tus propios tickets</p>
              )}
              {isTechnician && (
                <p className="page-subheading">
                  Solo ves los tickets asignados a ti; más abajo, los que hayas creado como solicitante.
                </p>
              )}
            </div>
            {user?.role === 'end_user' && (
              <button
                type="button"
                onClick={() => navigate('/tickets/crear')}
                className="btn-primary text-sm sm:text-base whitespace-nowrap"
              >
                Crear Ticket
              </button>
            )}
          </div>

          <div className="content-panel mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-5">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-sky-300"
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
                <h2 className="text-lg sm:text-xl font-semibold text-white">Filtros de Búsqueda</h2>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn-secondary flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap"
                aria-label="Limpiar todos los filtros"
                title="Limpiar filtros"
              >
                <ClearFiltersIcon className="w-4 h-4" />
                <span>Limpiar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-4 sm:mb-5">
              <div className="min-w-0">
                <label className="label-field flex items-center gap-2 !mb-2">
                  <svg
                    className="w-4 h-4 text-sky-300 shrink-0"
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
                    className="input-field flex-1 min-w-0 rounded-l-xl rounded-r-none border-r-0"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="btn-primary px-5 py-2.5 rounded-l-none rounded-r-xl flex-shrink-0"
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
                <label className="label-field flex items-center gap-2 !mb-2">
                  <svg
                    className="w-4 h-4 text-emerald-300 shrink-0"
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
                    className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
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
                      className="w-5 h-5 text-slate-400"
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
                <label className="label-field flex items-center gap-2 !mb-2">
                  <svg
                    className="w-4 h-4 text-violet-300 shrink-0"
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
                    className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
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
                      className="w-5 h-5 text-slate-400"
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
                <label className="label-field flex items-center gap-2 !mb-2">
                  <svg
                    className="w-4 h-4 text-amber-300 shrink-0"
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
                    className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
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
                      className="w-5 h-5 text-slate-400"
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

            {user?.role === 'administrator' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div className="min-w-0">
                  <label className="label-field flex items-center gap-2 !mb-2">
                    <svg
                      className="w-4 h-4 text-indigo-300 shrink-0"
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
                      className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
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
                        className="w-5 h-5 text-slate-400"
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

          {isTechnician && (
            <div className="mb-6 rounded-2xl border border-amber-400/35 bg-amber-500/15 backdrop-blur-sm px-4 py-4 sm:px-5">
              <h2 className="text-sm font-semibold text-amber-100 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Tickets que creaste
              </h2>
              {loadingCreatedByMe ? (
                <p className="text-xs text-amber-100/80">Cargando…</p>
              ) : createdByMeTickets.length === 0 ? (
                <p className="text-xs text-amber-100/80">Aún no has creado ningún ticket.</p>
              ) : (
                <ul className="tickets-list-light divide-y divide-gray-200 border border-sky-400/20 rounded-xl bg-white/95 overflow-hidden shadow-sm">
                  {createdByMeTickets.map((ticket) => (
                    <li key={ticket.id} className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm hover:bg-sky-50/80 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{ticket.title}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <StatusBadge estado={ticket.state_name || ''} colorOverride={ticket.state_color} />
                          {ticket.assigned_technician_name && (
                            <span className="text-xs text-gray-500 truncate">
                              Asignado: {ticket.assigned_technician_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                        className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-sm"
                      >
                        Ver
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {loadingTickets ? (
            <div className="card py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sky-400 border-t-transparent"></div>
              <p className="mt-3 text-blue-100/85">Cargando tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="card py-12 text-center">
              <p className="text-blue-100/80">
                {isTechnician ? 'No tienes tickets asignados con estos filtros.' : 'No se encontraron tickets'}
              </p>
            </div>
          ) : (
            <>
              {isTechnician && (
                <h2 className="text-lg font-semibold text-white mb-4">Tickets asignados a ti</h2>
              )}
              <div className="card !p-0 overflow-hidden">
                <ul className="tickets-list-light divide-y divide-gray-200 bg-white/95">
                  {tickets.map((ticket) => (
                    <li
                      key={ticket.id}
                      className="px-4 sm:px-6 py-4 hover:bg-sky-50/90 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <p className="text-sm sm:text-base font-medium text-gray-900 truncate w-full sm:w-auto">
                              {ticket.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
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
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <span className="truncate">ID: {ticket.id.substring(0, 8)}...</span>
                            <span className="truncate">Creado: {formatDate(ticket.created_at)}</span>
                            {ticket.closed_at && (
                              <span className="truncate">Cerrado: {formatDate(ticket.closed_at)}</span>
                            )}
                            <span className="truncate">Por: {ticket.created_by_user_name || 'N/A'}</span>
                            {ticket.assigned_technician_name && (
                              <span className="truncate">Asignado a: {ticket.assigned_technician_name}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-end sm:justify-start flex-wrap gap-2 flex-shrink-0">
                          {endUserCanMarkResolved(ticket) && (
                            <button
                              type="button"
                              onClick={() => markAsResolvedMutation.mutate(ticket.id)}
                              disabled={isMarkingResolved(ticket.id)}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:from-green-600 hover:to-green-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out whitespace-nowrap disabled:opacity-50"
                            >
                              {isMarkingResolved(ticket.id) ? 'Marcando…' : 'Marcar resuelto'}
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/tickets/${ticket.id}`)}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out whitespace-nowrap"
                          >
                            Ver
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => navigate(`/tickets/${ticket.id}/editar`)}
                              className="group p-2 sm:p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center"
                              title="Editar"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
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
                              className="group p-2 sm:p-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center"
                              title="Eliminar"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
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

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-blue-50/90 text-center sm:text-left">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} tickets
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))}
                    disabled={pagination.page === 1}
                    className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50"
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
