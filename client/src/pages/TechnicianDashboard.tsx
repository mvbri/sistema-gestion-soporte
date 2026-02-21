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

export const TechnicianDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 10,
    estado_id: undefined,
    assigned_technician_id: user?.id,
  });

  useEffect(() => {
    if (user?.role !== 'technician') {
      navigate('/dashboard');
      return;
    }
    if (user?.id) {
      setFilters((prev) => ({
        ...prev,
        assigned_technician_id: user.id,
      }));
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

  const handleStartProgress = (ticketId: string) => {
    startProgressMutation.mutate(ticketId);
  };

  const handleMarkAsResolved = (ticketId: string) => {
    markAsResolvedMutation.mutate(ticketId);
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
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando tickets...</p>
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
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Panel del Técnico</h1>
          <p className="mt-2 text-gray-600">Gestiona tus tickets asignados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-700 mb-4">Todos</div>
            <div className="text-3xl font-bold text-gray-700">
              {tickets.length}
            </div>
            <div className="absolute top-1/2 right-6 -translate-y-1/2 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-700 mb-4">Abiertos</div>
            <div className="text-3xl font-bold text-gray-700">
              {tickets.filter(t => t.estado_id === 1).length}
            </div>
            <div className="absolute top-1/2 right-6 -translate-y-1/2 flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-700 mb-4">Asignados</div>
            <div className="text-3xl font-bold text-gray-700">
              {tickets.filter(t => t.estado_id === 2).length}
            </div>
            <div className="absolute top-1/2 right-6 -translate-y-1/2 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-700 mb-4">En Proceso</div>
            <div className="text-3xl font-bold text-gray-700">
              {tickets.filter(t => t.estado_id === 3).length}
            </div>
            <div className="absolute top-1/2 right-6 -translate-y-1/2 flex items-center justify-center">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-700 mb-4">Resueltos</div>
            <div className="text-3xl font-bold text-green-600">
              {tickets.filter(t => t.estado_id === 4).length}
            </div>
            <div className="absolute top-1/2 right-6 -translate-y-1/2 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-700 mb-4">Cerrados</div>
            <div className="text-3xl font-bold text-gray-700">
              {tickets.filter(t => t.estado_id === 5).length}
            </div>
            <div className="absolute top-1/2 right-6 -translate-y-1/2 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-xl p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg
                className="w-6 h-6 text-green-600"
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
              <label className="text-base font-semibold text-gray-800">Filtrar por estado</label>
            </div>
            {filters.estado_id && (
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    estado_id: undefined,
                    page: 1,
                    assigned_technician_id: user?.id,
                  }))
                }
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-800 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow"
                title="Limpiar filtro"
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
            )}
          </div>
          <div className="mt-4">
            <div className="relative max-w-md">
              <select
                value={filters.estado_id || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    estado_id: e.target.value ? parseInt(e.target.value) : undefined,
                    page: 1,
                    assigned_technician_id: user?.id,
                  }))
                }
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white shadow-sm hover:shadow-md appearance-none cursor-pointer text-gray-700 font-medium"
              >
                <option value="">Todos los estados</option>
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
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No hay tickets disponibles
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <button
                            onClick={() => navigate(`/tickets/${ticket.id}`)}
                            className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150 hover:underline"
                          >
                            {ticket.title}
                          </button>
                          <p className="text-sm text-gray-500">ID: {ticket.id.substring(0, 8)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge
                          estado={ticket.state_name || ''}
                          colorOverride={ticket.state_color}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge
                          prioridad={ticket.priority_name || ''}
                          colorOverride={ticket.priority_color}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CategoryBadge categoria={ticket.category_name || ''} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(ticket.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {ticket.estado_id === 2 && (
                            <button
                              onClick={() => handleStartProgress(ticket.id)}
                              disabled={startProgressMutation.isPending}
                              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium shadow-md hover:from-orange-600 hover:to-orange-700 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md transition-all duration-200 ease-in-out"
                            >
                              Iniciar Progreso
                            </button>
                          )}
                          {ticket.estado_id === 3 && (
                            <button
                              onClick={() => handleMarkAsResolved(ticket.id)}
                              disabled={markAsResolvedMutation.isPending}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium shadow-md hover:from-green-600 hover:to-green-700 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md transition-all duration-200 ease-in-out"
                            >
                              Marcar Resuelto
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/tickets/${ticket.id}`)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out"
                          >
                            Ver Detalle
                          </button>
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! - 1, assigned_technician_id: user?.id }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:shadow-none transition-all duration-200 ease-in-out"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1, assigned_technician_id: user?.id }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:shadow-none transition-all duration-200 ease-in-out"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    de <span className="font-medium">{pagination.total}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! - 1, assigned_technician_id: user?.id }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-4 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:shadow-none transition-all duration-200 ease-in-out"
                    >
                      Anterior
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 bg-gray-50 text-sm font-medium text-gray-700">
                      Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1, assigned_technician_id: user?.id }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center px-4 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:shadow-none transition-all duration-200 ease-in-out"
                    >
                      Siguiente
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
      </PageWrapper>
    </>
  );
};
