import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
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
  pending: 'bg-amber-100 text-amber-900',
  approved: 'bg-emerald-100 text-emerald-900',
  delivered: 'bg-blue-100 text-blue-900',
  overdue: 'bg-red-100 text-red-900',
  returned: 'bg-slate-200 text-slate-800',
  rejected: 'bg-rose-100 text-rose-900',
  cancelled: 'bg-slate-200 text-slate-800',
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'N/A';
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
        <div className="py-6 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Historial de Préstamos</h1>
          <p className="text-sm text-gray-600 mb-5">
            {isAdministrator
              ? 'Historial general de solicitudes con su solicitante.'
              : 'Historial del usuario y estado de cada solicitud.'}
          </p>

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
                      setSearch(undefined);
                      setPage(1);
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
                Filtra por estado o usa búsqueda por código y solicitante.
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={status || ''}
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
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-gray-600">Cargando historial...</div>
          ) : (
            <>
              <div className="rounded-lg border bg-white overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-center">Código de solicitud</th>
                      {isAdministrator && <th className="px-3 py-2 text-center">Solicitante</th>}
                      <th className="px-3 py-2 text-center">Estado</th>
                      <th className="px-3 py-2 text-center">Inicio</th>
                      <th className="px-3 py-2 text-center">Devolución esperada</th>
                      <th className="px-3 py-2 text-center">Items</th>
                      <th className="px-3 py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.loans?.map((loan) => (
                      <tr key={loan.id} className="border-t">
                        <td className="bg-slate-50 px-3 py-2 text-center font-medium text-slate-700">
                          {loan.request_code || `SOL-${loan.id}`}
                        </td>
                        {isAdministrator && <td className="px-3 py-2 text-center">{loan.requester_name}</td>}
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              loanStatusBadgeStyles[loan.status]
                            }`}
                          >
                            {loanStatusLabels[loan.status] || loan.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">{formatDateTime(loan.start_date)}</td>
                        <td className="px-3 py-2 text-center">{formatDateTime(loan.expected_return_date)}</td>
                        <td className="px-3 py-2 text-center">{loan.items_count}</td>
                        <td className="px-3 py-2 text-center">
                          <Link
                            to={`/loans/${loan.id}`}
                            className="inline-flex items-center justify-center rounded-md p-1.5 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                            title="Ver detalle"
                            aria-label="Ver detalle"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
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
                {data?.loans?.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    {isAdministrator
                      ? 'No hay préstamos registrados.'
                      : 'No tienes préstamos registrados.'}
                  </div>
                )}
              </div>

              {!!data?.loans?.length && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                    {pagination.total} solicitudes
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
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
                      onClick={() => setPage((prev) => prev + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </PageWrapper>
    </>
  );
};
