import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
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

export const LoansList: React.FC = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<EquipmentLoanFilters>({ page: 1, limit: 10 });
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
    setFilters({ page: 1, limit: 10 });
  };

  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const loans = data?.loans || [];

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="py-6 px-4 max-w-7xl mx-auto">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Préstamos de Equipos</h1>
              <p className="text-sm text-gray-600">
                Bandeja de solicitudes, entregas y devoluciones.
              </p>
            </div>
            <Link
              to="/loans/create"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Nueva solicitud
            </Link>
          </div>

          <div className="mb-4 rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                Filtros de búsqueda
              </h2>
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50"
              >
                Limpiar filtros
              </button>
            </div>
            <div className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 flex gap-2">
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
                  placeholder="Buscar por código, solicitante o área..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                >
                  Buscar
                </button>
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                Filtra por estado y rango de fechas para ubicar solicitudes rápidamente.
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={filters.status || ''}
                onChange={(e) => onStatusChange(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Todos los estados</option>
                {Object.entries(loanStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
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
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, date_to: e.target.value || undefined, page: 1 }))
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-gray-600">Cargando préstamos...</div>
          ) : (
            <div className="rounded-lg border bg-white overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Solicitante</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                    <th className="px-3 py-2 text-left">Inicio</th>
                    <th className="px-3 py-2 text-left">Devolución</th>
                    <th className="px-3 py-2 text-left">Items</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <tr key={loan.id} className="border-t">
                      <td className="px-3 py-2">{loan.request_code || `#${loan.id}`}</td>
                      <td className="px-3 py-2">{loan.requester_name}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            loanStatusBadgeStyles[loan.status]
                          }`}
                        >
                          {loanStatusLabels[loan.status]}
                        </span>
                      </td>
                      <td className="px-3 py-2">{loan.start_date}</td>
                      <td className="px-3 py-2">{loan.expected_return_date}</td>
                      <td className="px-3 py-2">{loan.items_count}</td>
                      <td className="px-3 py-2 text-right space-x-2">
                        <Link to={`/loans/${loan.id}`} className="text-blue-600 hover:underline">
                          Ver detalle
                        </Link>
                        {loan.status === 'pending' && canReviewLoans && (
                          <>
                            <button
                              type="button"
                              className="text-emerald-600 hover:underline"
                              onClick={async () => {
                                await approveLoan.mutateAsync({ id: loan.id });
                                refetch();
                              }}
                            >
                              Aprobar
                            </button>
                            <button
                              type="button"
                              className="text-red-600 hover:underline"
                              onClick={() => setRejectModalLoanId(loan.id)}
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        {loan.status === 'pending' && loan.requester_user_id === user?.id && (
                          <button
                            type="button"
                            className="text-red-600 hover:underline"
                            onClick={async () => {
                              await cancelLoan.mutateAsync({
                                id: loan.id,
                                notes: 'Cancelado por solicitante',
                              });
                              refetch();
                            }}
                          >
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loans.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No hay préstamos para los filtros actuales.
                </div>
              )}
            </div>
          )}

          {!isLoading && loans.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} solicitudes
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: Math.max((prev.page || 1) - 1, 1) }))
                  }
                  disabled={pagination.page === 1}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-2 py-1.5 text-sm text-gray-700">
                  Página {pagination.page} de {pagination.totalPages || 1}
                </span>
                <button
                  type="button"
                  onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>

        {rejectModalLoanId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900">Rechazar préstamo</h3>
              <p className="mt-1 text-sm text-slate-600">
                Escribe el motivo del rechazo para la solicitud #{rejectModalLoanId}.
              </p>
              <label className="mt-4 block text-sm font-medium text-slate-700">
                Motivo del rechazo
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                  placeholder="Ej: No hay disponibilidad en las fechas solicitadas."
                />
              </label>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModalLoanId(null);
                    setRejectReason('');
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                >
                  {rejectLoan.isPending ? 'Rechazando...' : 'Confirmar rechazo'}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageWrapper>
    </>
  );
};
