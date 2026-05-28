import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useTickets, useEstados, useStartProgress, useMarkAsResolved } from '../hooks/useTickets';
import type { TicketFilters } from '../types';
import { StatusBadge } from '../components/tickets/StatusBadge';
import { PriorityBadge } from '../components/tickets/PriorityBadge';
import { CategoryBadge } from '../components/tickets/CategoryBadge';
import { ClearFiltersIcon } from '../components/icons/ClearFiltersIcon';

export const TechnicianDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initialFilters: TicketFilters = {
    page: 1,
    limit: 10,
    estado_id: undefined,
  };
  const [filters, setFilters] = useState<TicketFilters>(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.role !== 'technician') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const { data: ticketsData, isLoading: loadingTickets } = useTickets(filters);
  const { data: estados = [] } = useEstados();
  const startProgressMutation = useStartProgress();
  const markAsResolvedMutation = useMarkAsResolved();

  const tickets = ticketsData?.tickets || [];
  const pagination = ticketsData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  const filtersForCounts: TicketFilters = {
    page: 1,
    limit: 1000,
  };
  const { data: allTicketsData } = useTickets(filtersForCounts);
  const allTickets = allTicketsData?.tickets || [];

  const handleStartProgress = (ticketId: string) => {
    startProgressMutation.mutate(ticketId);
  };

  const handleMarkAsResolved = (ticketId: string) => {
    markAsResolvedMutation.mutate(ticketId);
  };

  const handleFilterChange = (key: keyof TicketFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, busqueda: searchTerm || undefined, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({ ...initialFilters });
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

  if (loadingTickets) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
            <div className="py-4 sm:py-6">
              <div className="card py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sky-400 border-t-transparent" />
                <p className="mt-3 text-blue-100/85">Cargando tickets…</p>
              </div>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <header className="mb-6">
              <h1 className="page-heading">Panel del técnico</h1>
              <p className="page-subheading">Gestiona tus tickets asignados.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="stat-card stat-card--sky">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="stat-card-title">Todos</p>
                    <p className="stat-card-value">{allTickets.length}</p>
                  </div>
                  <div className="stat-card-icon stat-card-icon--sky">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="stat-card stat-card--sky">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="stat-card-title">Abiertos</p>
                    <p className="stat-card-value">{allTickets.filter((t) => t.state_id === 1).length}</p>
                  </div>
                  <div className="stat-card-icon stat-card-icon--sky">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="stat-card stat-card--amber">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="stat-card-title">Asignados</p>
                    <p className="stat-card-value">{allTickets.filter((t) => t.state_id === 2).length}</p>
                  </div>
                  <div className="stat-card-icon stat-card-icon--amber">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="stat-card stat-card--amber">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="stat-card-title">En proceso</p>
                    <p className="stat-card-value">{allTickets.filter((t) => t.state_id === 3).length}</p>
                  </div>
                  <div className="stat-card-icon stat-card-icon--amber">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="stat-card stat-card--emerald">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="stat-card-title">Resueltos</p>
                    <p className="stat-card-value">{allTickets.filter((t) => t.state_id === 4).length}</p>
                  </div>
                  <div className="stat-card-icon stat-card-icon--emerald">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="stat-card stat-card--violet">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="stat-card-title">Cerrados</p>
                    <p className="stat-card-value">{allTickets.filter((t) => t.state_id === 5).length}</p>
                  </div>
                  <div className="stat-card-icon stat-card-icon--violet">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="content-panel mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-5">
                <div className="flex items-center gap-2">
              <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-sky-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                    aria-hidden
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="min-w-0">
                  <label className="label-field flex items-center gap-2 !mb-2">
                <svg
                      className="w-4 h-4 text-sky-300 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                      aria-hidden
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
                      setFilters((prev) => ({ ...prev, busqueda: undefined, page: 1, assigned_technician_id: user?.id }));
                    }
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Título o descripción..."
                      className="input-field flex-1 min-w-0 rounded-l-xl rounded-r-none border-r-0"
                />
                <button
                  onClick={handleSearch}
                      className="btn-primary px-5 py-2.5 rounded-l-none rounded-r-xl flex-shrink-0"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                        aria-hidden
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
                      aria-hidden
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
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                        aria-hidden
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
        </div>

            <div className="card !p-0 overflow-hidden">
              <div className="tickets-list-light overflow-x-auto bg-white/95">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Ticket
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Prioridad
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-gray-500">
                          No hay tickets disponibles
                        </td>
                      </tr>
                    ) : (
                      tickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="min-w-0">
                              <button
                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                                className="text-blue-600 hover:underline font-semibold truncate"
                              >
                                {ticket.title}
                              </button>
                              <p className="text-xs text-gray-500">ID: {ticket.id.substring(0, 8)}...</p>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <StatusBadge estado={ticket.state_name || ''} colorOverride={ticket.state_color} />
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <PriorityBadge prioridad={ticket.priority_name || ''} colorOverride={ticket.priority_color} />
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <CategoryBadge categoria={ticket.category_name || ''} />
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(ticket.created_at)}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-wrap gap-2">
                              {(ticket.state_id || ticket.estado_id) === 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleStartProgress(ticket.id)}
                                  disabled={startProgressMutation.isPending}
                                  className="btn-warning px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50"
                                >
                                  Iniciar progreso
                                </button>
                              )}
                              {(ticket.state_id || ticket.estado_id) === 3 && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkAsResolved(ticket.id)}
                                  disabled={markAsResolvedMutation.isPending}
                                  className="btn-primary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50"
                                >
                                  Marcar resuelto
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                                className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
                              >
                                Ver detalle
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs sm:text-sm text-blue-50/90">
                  Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} tickets
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page! - 1, assigned_technician_id: user?.id }))
                    }
                    disabled={pagination.page === 1}
                    className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="flex items-center px-2 text-xs sm:text-sm text-blue-100/75 tabular-nums">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, page: prev.page! + 1, assigned_technician_id: user?.id }))
                    }
                    disabled={pagination.page >= pagination.totalPages}
                    className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
