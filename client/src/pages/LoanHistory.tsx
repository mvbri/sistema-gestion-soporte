import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { ClearFiltersIcon } from '../components/icons/ClearFiltersIcon';
import { useLoans } from '../hooks/useLoans';
import { useAuth } from '../hooks/useAuth';
import type { LoanStatus } from '../types';

const loanStatusLabels: Record<LoanStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  delivered: 'Entregado',
  overdue: 'Vencido',
  returned: 'Devuelto',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
};

const loanStatusBadgeStyles: Record<LoanStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  delivered: 'bg-blue-100 text-blue-800 border-blue-200',
  overdue: 'bg-red-100 text-red-800 border-red-200',
  returned: 'bg-slate-100 text-slate-700 border-slate-200',
  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
  cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const LoanHistory: React.FC = () => {
  const { user } = useAuth();
  const isAdministrator = user?.role === 'administrator';
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<LoanStatus | undefined>(undefined);
  const { data, isLoading } = useLoans(
    isAdministrator
      ? { page, limit: 10, search, status }
      : { requester_user_id: user?.id, page, limit: 10, search, status }
  );
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const loans = data?.loans || [];

  const onStatusChange = (value: string) => {
    setStatus(value ? (value as LoanStatus) : undefined);
    setPage(1);
  };

  const handleSearch = () => {
    setSearch(searchTerm.trim() || undefined);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSearch(undefined);
    setStatus(undefined);
    setPage(1);
  };

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <header className="mb-6">
              <h1 className="page-heading">Historial de Préstamos</h1>
              <p className="page-subheading">
                {isAdministrator
                  ? 'Historial general de solicitudes con su solicitante.'
                  : 'Historial del usuario y estado de cada solicitud.'}
              </p>
            </header>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div className="min-w-0 sm:col-span-2 lg:col-span-2">
                  <label htmlFor="loan-search" className="label-field flex items-center gap-2 !mb-2">
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
                      id="loan-search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchTerm(value);
                        if (value === '') {
                          setSearch(undefined);
                          setPage(1);
                        }
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Código, solicitante o área…"
                      className="input-field flex-1 min-w-0 rounded-l-xl rounded-r-none border-r-0"
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="btn-primary px-5 py-2.5 rounded-l-none rounded-r-xl flex-shrink-0"
                      aria-label="Buscar préstamos"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
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
                  <label htmlFor="loan-status" className="label-field flex items-center gap-2 !mb-2">
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
                      id="loan-status"
                      value={status || ''}
                      onChange={(e) => onStatusChange(e.target.value)}
                      className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
                    >
                      <option value="">Todos los estados</option>
                      {Object.entries(loanStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="card py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sky-400 border-t-transparent" />
                <p className="mt-3 text-blue-100/85">Cargando historial…</p>
              </div>
            ) : loans.length === 0 ? (
              <div className="card py-12 text-center px-4">
                <p className="text-blue-100/80">
                  {isAdministrator
                    ? 'No hay préstamos registrados.'
                    : 'No tienes préstamos registrados.'}
                </p>
                <p className="text-sm text-blue-100/60 mt-2">
                  Prueba ajustar la búsqueda o el filtro de estado.
                </p>
                <button type="button" onClick={handleClearFilters} className="btn-secondary mt-4 text-sm">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <>
                <div className="card !p-0 overflow-hidden">
                  <div className="tickets-list-light overflow-x-auto bg-white/95">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Código de solicitud
                          </th>
                          {isAdministrator && (
                            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Solicitante
                            </th>
                          )}
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Estado
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                            Inicio
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                            Devolución esperada
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Ítems
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loans.map((loan) => (
                          <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <span className="text-sm font-semibold text-gray-900">
                                {loan.request_code || `SOL-${loan.id}`}
                              </span>
                            </td>
                            {isAdministrator && (
                              <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-700">
                                {loan.requester_name || '—'}
                              </td>
                            )}
                            <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${
                                  loanStatusBadgeStyles[loan.status]
                                }`}
                              >
                                {loanStatusLabels[loan.status] || loan.status}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 whitespace-nowrap hidden md:table-cell">
                              {formatDateTime(loan.start_date)}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-600 whitespace-nowrap hidden lg:table-cell">
                              {formatDateTime(loan.expected_return_date)}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-700 text-center tabular-nums">
                              {loan.items_count}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
                              <Link
                                to={`/loans/${loan.id}`}
                                className="inline-flex items-center justify-center p-2 sm:p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all"
                                title="Ver detalle"
                                aria-label="Ver detalle"
                              >
                                <svg
                                  className="h-4 w-4 sm:h-5 sm:w-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  aria-hidden
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {pagination.totalPages > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs sm:text-sm text-blue-50/90 text-center sm:text-left">
                      Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}{' '}
                      solicitudes
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={pagination.page === 1}
                        className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <span className="px-2 text-xs text-blue-100/80 sm:text-sm tabular-nums">
                        {pagination.page} / {pagination.totalPages || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
