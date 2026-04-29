import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useAuth } from '../hooks/useAuth';
import {
  useApproveMaterialRequest,
  useCancelMaterialRequest,
  useMaterialRequests,
} from '../hooks/useMaterialRequests';
import type { MaterialRequestFilters, MaterialRequestStatus } from '../types';
import { ConfirmCancelMaterialRequestModal } from '../components/materialRequests/ConfirmCancelMaterialRequestModal';
import { MaterialRequestStatusBadge } from '../components/materialRequests/MaterialRequestStatusBadge';
import { materialRequestStatusLabels } from '../utils/materialRequestDisplay';

export const MaterialRequestsList: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'administrator';
  const [filters, setFilters] = useState<MaterialRequestFilters>({ page: 1, limit: 10 });
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelModal, setCancelModal] = useState<{
    id: number;
    requestCode: string;
    notes: string;
    wasApproved: boolean;
  } | null>(null);
  const { data, isLoading, refetch } = useMaterialRequests(filters);
  const approveRequest = useApproveMaterialRequest();
  const cancelRequest = useCancelMaterialRequest();

  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  const requests = data?.requests || [];

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isAdmin ? 'Todas las Solicitudes de Materiales' : 'Mis Solicitudes de Materiales'}
              </h1>
              <p className="text-sm text-gray-600">
                Registro con paginación, filtros, buscador y trazabilidad de cambios.
              </p>
            </div>
            <Link
              to="/material-requests/create"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Nueva solicitud
            </Link>
          </div>

          <div className="mb-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="relative sm:col-span-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' &&
                    setFilters((prev) => ({ ...prev, search: searchTerm || undefined, page: 1 }))
                  }
                  placeholder="Buscar por código, solicitante o nota..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm"
                  aria-label="Buscar solicitudes"
                />
                <svg
                  className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
              </div>
              <select
                value={filters.status || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: (e.target.value || undefined) as MaterialRequestStatus | undefined,
                    page: 1,
                  }))
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Todos los estados</option>
                {Object.entries(materialRequestStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, date_from: e.target.value || undefined, page: 1 }))
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, date_to: e.target.value || undefined, page: 1 }))
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-14 text-center text-gray-600">Cargando solicitudes...</div>
          ) : (
            <div className="rounded-lg border bg-white overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Código</th>
                    <th className="px-3 py-2 text-left">Solicitante</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                    <th className="px-3 py-2 text-left">Fecha</th>
                    <th className="px-3 py-2 text-left">Items</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-t">
                      <td className="bg-slate-50 px-3 py-2 font-medium text-slate-700">
                        {request.request_code || `#${request.id}`}
                      </td>
                      <td className="px-3 py-2">{request.requester_name}</td>
                      <td className="px-3 py-2">
                        <MaterialRequestStatusBadge status={request.status} />
                      </td>
                      <td className="px-3 py-2">
                        {new Date(request.created_at).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-3 py-2">{request.items_count}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
                          <Link
                            to={`/material-requests/${request.id}`}
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
                          {isAdmin && request.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                className="group inline-flex items-center justify-center rounded-md p-1.5 text-emerald-600 shadow-sm ring-1 ring-transparent transition hover:bg-gradient-to-r hover:from-emerald-600 hover:to-green-600 hover:text-white hover:shadow-md hover:ring-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
                                title="Aprobar solicitud"
                                aria-label="Aprobar solicitud"
                                onClick={async () => {
                                  await approveRequest.mutateAsync({ id: request.id });
                                  refetch();
                                }}
                              >
                                <svg
                                  className="h-4 w-4 transition-transform group-hover:scale-105"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                  aria-hidden="true"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>
                            </>
                          )}
                          {((request.requester_user_id === user?.id && request.status === 'pending') ||
                            (isAdmin &&
                              (request.status === 'pending' || request.status === 'approved'))) && (
                            <button
                              type="button"
                              className="group inline-flex items-center justify-center rounded-md p-1.5 text-rose-600 shadow-sm ring-1 ring-transparent transition hover:bg-gradient-to-r hover:from-rose-600 hover:to-red-600 hover:text-white hover:shadow-md hover:ring-rose-500/20 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-1"
                              title="Cancelar solicitud"
                              aria-label="Cancelar solicitud"
                              onClick={() =>
                                setCancelModal({
                                  id: request.id,
                                  requestCode: request.request_code || `#${request.id}`,
                                  notes: isAdmin
                                    ? 'Cancelado por administrador'
                                    : 'Cancelado por solicitante',
                                  wasApproved: request.status === 'approved',
                                })
                              }
                            >
                              <svg
                                className="h-4 w-4 transition-transform group-hover:scale-105"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {requests.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No hay solicitudes para los filtros actuales.
                </div>
              )}
            </div>
          )}

          {!isLoading && requests.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
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

        <ConfirmCancelMaterialRequestModal
          isOpen={!!cancelModal}
          onClose={() => setCancelModal(null)}
          onConfirm={async () => {
            if (!cancelModal) return;
            await cancelRequest.mutateAsync({
              id: cancelModal.id,
              notes: cancelModal.notes,
            });
            setCancelModal(null);
            refetch();
          }}
          requestCode={cancelModal?.requestCode ?? ''}
          wasApproved={cancelModal?.wasApproved ?? false}
          isConfirming={cancelRequest.isPending}
        />
      </PageWrapper>
    </>
  );
};
