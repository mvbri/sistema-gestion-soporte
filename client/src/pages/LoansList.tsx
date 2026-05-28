import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { ClearFiltersIcon } from '../components/icons/ClearFiltersIcon';
import { useLoans, useCancelLoan, useApproveLoan, useRejectLoan } from '../hooks/useLoans';
import { useAuth } from '../hooks/useAuth';
import type { EquipmentLoanFilters, LoanStatus } from '../types';

const loanStatusLabels: Record<LoanStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  delivered: 'Entregado',
  returned: 'Devuelto',
  rejected: 'Rechazado',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
};

const loanStatusBadgeStyles: Record<LoanStatus, string> = {
  pending: 'bg-amber-100 text-amber-900',
  approved: 'bg-emerald-100 text-emerald-900',
  delivered: 'bg-blue-100 text-blue-900',
  returned: 'bg-slate-200 text-slate-800',
  rejected: 'bg-rose-100 text-rose-900',
  overdue: 'bg-red-100 text-red-900',
  cancelled: 'bg-slate-200 text-slate-800',
};

const formatLoanDate = (dateString: string | null | undefined) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const LoansList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialFilters: EquipmentLoanFilters = { page: 1, limit: 10 };
  const [filters, setFilters] = useState<EquipmentLoanFilters>(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectModalLoanId, setRejectModalLoanId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const { data, isLoading, refetch } = useLoans(filters);
  const cancelLoan = useCancelLoan();
  const approveLoan = useApproveLoan();
  const rejectLoan = useRejectLoan();
  const canReviewLoans = user?.role === 'administrator';

  const onStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status ? (status as LoanStatus) : undefined,
      page: 1,
    }));
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchTerm || undefined, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters(initialFilters);
  };

  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const loans = data?.loans || [];

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="page-heading">Préstamos de equipos</h1>
                <p className="page-subheading">
                  Bandeja de solicitudes, entregas y devoluciones.
                </p>
              </div>
              <Link
                to="/loans/create"
                className="btn-primary text-sm sm:text-base whitespace-nowrap text-center"
              >
                Nueva solicitud
              </Link>
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
                >
                  <ClearFiltersIcon className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-4 sm:mb-5">
                <div className="min-w-0 sm:col-span-2">
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
                          setFilters((prev) => ({ ...prev, search: undefined, page: 1 }));
                        }
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Código, solicitante o área..."
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
                      value={filters.status || ''}
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
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Desde</span>
                  </label>
                  <input
                    type="date"
                    value={filters.date_from || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        date_from: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="input-field w-full py-2.5 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div className="min-w-0">
                  <label className="label-field flex items-center gap-2 !mb-2">
                    <svg
                      className="w-4 h-4 text-amber-300 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Hasta</span>
                  </label>
                  <input
                    type="date"
                    value={filters.date_to || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        date_to: e.target.value || undefined,
                        page: 1,
                      }))
                    }
                    className="input-field w-full py-2.5 [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="card py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sky-400 border-t-transparent" />
                <p className="mt-3 text-blue-100/85">Cargando préstamos…</p>
              </div>
            ) : loans.length === 0 ? (
              <div className="card py-12 text-center px-4">
                <p className="text-blue-100/80">No hay préstamos para los filtros actuales.</p>
                <p className="text-sm text-blue-100/60 mt-2">
                  Prueba ajustar el estado o el rango de fechas.
                </p>
              </div>
            ) : (
              <>
                <div className="card !p-0 overflow-hidden">
                  <ul className="tickets-list-light divide-y divide-gray-200 bg-white/95">
                    {loans.map((loan) => (
                      <li
                        key={loan.id}
                        className="px-4 sm:px-6 py-4 hover:bg-sky-50/90 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <p className="text-sm sm:text-base font-medium text-gray-900">
                                {loan.request_code || `#${loan.id}`}
                              </p>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  loanStatusBadgeStyles[loan.status]
                                }`}
                              >
                                {loanStatusLabels[loan.status]}
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-x-4 sm:gap-y-1 text-xs sm:text-sm text-gray-600">
                              <span className="truncate">
                                Solicitante: {loan.requester_name || '—'}
                              </span>
                              {loan.target_incident_area_name ? (
                                <span className="truncate">
                                  Área: {loan.target_incident_area_name}
                                </span>
                              ) : null}
                              <span>Inicio: {formatLoanDate(loan.start_date)}</span>
                              <span>Devolución: {formatLoanDate(loan.expected_return_date)}</span>
                              <span>
                                {loan.items_count === 1 ? '1 equipo' : `${loan.items_count} equipos`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-end flex-wrap gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => navigate(`/loans/${loan.id}`)}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out whitespace-nowrap"
                            >
                              Ver
                            </button>
                            {loan.status === 'pending' && canReviewLoans && (
                              <>
                                <button
                                  type="button"
                                  disabled={approveLoan.isPending}
                                  onClick={async () => {
                                    await approveLoan.mutateAsync({ id: loan.id });
                                    refetch();
                                  }}
                                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:from-green-600 hover:to-green-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out whitespace-nowrap disabled:opacity-50"
                                >
                                  Aprobar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectModalLoanId(loan.id)}
                                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out whitespace-nowrap"
                                >
                                  Rechazar
                                </button>
                              </>
                            )}
                            {loan.status === 'pending' && loan.requester_user_id === user?.id && (
                              <button
                                type="button"
                                disabled={cancelLoan.isPending}
                                onClick={async () => {
                                  await cancelLoan.mutateAsync({
                                    id: loan.id,
                                    notes: 'Cancelado por solicitante',
                                  });
                                  refetch();
                                }}
                                className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap disabled:opacity-50"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {pagination.totalPages > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs sm:text-sm text-blue-50/90">
                      Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                      {pagination.total} solicitudes
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            page: Math.max((prev.page || 1) - 1, 1),
                          }))
                        }
                        disabled={pagination.page === 1}
                        className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <span className="flex items-center px-2 text-xs sm:text-sm text-blue-100/75 tabular-nums">
                        {pagination.page} / {pagination.totalPages || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
                        }
                        disabled={pagination.page >= pagination.totalPages}
                        className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

        {rejectModalLoanId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3 sm:p-4">
            <div className="card w-full max-w-md !p-6">
              <h3 className="text-lg font-semibold text-white">Rechazar préstamo</h3>
              <p className="mt-2 text-sm text-blue-100/80">
                Indica el motivo del rechazo para la solicitud #{rejectModalLoanId}.
              </p>
              <label className="label-field mt-4 block" htmlFor="reject-reason">
                Motivo del rechazo
              </label>
              <textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Ej: No hay disponibilidad en las fechas solicitadas."
                className="input-dark resize-y min-h-[5.5rem] w-full"
              />
              <footer className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModalLoanId(null);
                    setRejectReason('');
                  }}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={rejectLoan.isPending}
                  onClick={async () => {
                    await rejectLoan.mutateAsync({
                      id: rejectModalLoanId,
                      reason: rejectReason.trim() || 'Rechazado por revisión administrativa',
                    });
                    setRejectModalLoanId(null);
                    setRejectReason('');
                    refetch();
                  }}
                  className="btn-danger w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rejectLoan.isPending ? 'Rechazando…' : 'Confirmar rechazo'}
                </button>
              </footer>
            </div>
          </div>
        )}
      </PageWrapper>
    </>
  );
};
