import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Eye, X } from 'lucide-react';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { ClearFiltersIcon } from '../components/icons/ClearFiltersIcon';
import { useAuth } from '../hooks/useAuth';
import {
  useApproveMaterialRequest,
  useCancelMaterialRequest,
  useMaterialRequests,
} from '../hooks/useMaterialRequests';
import type {
  MaterialRequestFilters,
  MaterialRequestListItem,
  MaterialRequestStatus,
} from '../types';
import { ConfirmCancelMaterialRequestModal } from '../components/materialRequests/ConfirmCancelMaterialRequestModal';
import { MaterialRequestStatusBadge } from '../components/materialRequests/MaterialRequestStatusBadge';
import { materialRequestStatusLabels } from '../utils/materialRequestDisplay';

const initialFilters: MaterialRequestFilters = { page: 1, limit: 10 };

const formatRequestDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const iconActionClass =
  'inline-flex items-center justify-center rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';

interface RequestRowActionsProps {
  request: MaterialRequestListItem;
  isAdmin: boolean;
  userId?: number;
  onApprove: () => void;
  onCancel: () => void;
}

const RequestRowActions: React.FC<RequestRowActionsProps> = ({
  request,
  isAdmin,
  userId,
  onApprove,
  onCancel,
}) => {
  const canApprove = isAdmin && request.status === 'pending';
  const canCancel =
    (request.requester_user_id === userId && request.status === 'pending') ||
    (isAdmin && (request.status === 'pending' || request.status === 'approved'));

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
      <Link
        to={`/material-requests/${request.id}`}
        className={`${iconActionClass} text-sky-300 hover:bg-sky-500/20 hover:text-white focus:ring-sky-400`}
        title="Ver detalle"
        aria-label="Ver detalle"
      >
        <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
      </Link>
      {canApprove && (
        <button
          type="button"
          className={`${iconActionClass} text-emerald-300 hover:bg-emerald-500/20 hover:text-white focus:ring-emerald-400`}
          title="Aprobar solicitud"
          aria-label="Aprobar solicitud"
          onClick={onApprove}
        >
          <Check className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        </button>
      )}
      {canCancel && (
        <button
          type="button"
          className={`${iconActionClass} text-rose-300 hover:bg-rose-500/20 hover:text-white focus:ring-rose-400`}
          title="Cancelar solicitud"
          aria-label="Cancelar solicitud"
          onClick={onCancel}
        >
          <X className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        </button>
      )}
    </div>
  );
};

export const MaterialRequestsList: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'administrator';
  const [filters, setFilters] = useState<MaterialRequestFilters>(initialFilters);
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

  const applySearch = () => {
    setFilters((prev) => ({ ...prev, search: searchTerm.trim() || undefined, page: 1 }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters(initialFilters);
  };

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="page-heading">
                  {isAdmin ? 'Solicitudes de materiales' : 'Mis solicitudes de materiales'}
                </h1>
                <p className="page-subheading">
                  Consulta, filtra y gestiona las solicitudes registradas.
                </p>
              </div>
              <Link
                to="/material-requests/create"
                className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap"
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
                  onClick={clearFilters}
                  className="btn-secondary flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap"
                  aria-label="Limpiar todos los filtros"
                  title="Limpiar filtros"
                >
                  <ClearFiltersIcon className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
                <div className="min-w-0 sm:col-span-2 lg:col-span-3">
                  <label htmlFor="mr-search" className="label-field flex items-center gap-2 !mb-2">
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
                      id="mr-search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchTerm(value);
                        if (value === '') {
                          setFilters((prev) => ({ ...prev, search: undefined, page: 1 }));
                        }
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                      placeholder="Código, solicitante o nota…"
                      className="input-field flex-1 min-w-0 rounded-l-xl rounded-r-none border-r-0"
                    />
                    <button
                      type="button"
                      onClick={applySearch}
                      className="btn-primary px-5 py-2.5 rounded-l-none rounded-r-xl flex-shrink-0"
                      aria-label="Buscar solicitudes"
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
                  <label htmlFor="mr-status" className="label-field flex items-center gap-2 !mb-2">
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
                      id="mr-status"
                      value={filters.status || ''}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          status: (e.target.value || undefined) as MaterialRequestStatus | undefined,
                          page: 1,
                        }))
                      }
                      className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
                    >
                      <option value="">Todos los estados</option>
                      {Object.entries(materialRequestStatusLabels).map(([value, label]) => (
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

                <div className="min-w-0">
                  <label htmlFor="mr-date-from" className="label-field flex items-center gap-2 !mb-2">
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
                    id="mr-date-from"
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

                <div className="min-w-0">
                  <label htmlFor="mr-date-to" className="label-field flex items-center gap-2 !mb-2">
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
                    id="mr-date-to"
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

            <div className="card !p-5 sm:!p-6">
              <div className="mb-4 flex items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold text-white sm:text-lg">Solicitudes</h2>
                {!isLoading && (
                  <span className="text-xs tabular-nums text-sky-200/70">{pagination.total} en total</span>
                )}
              </div>

              {isLoading ? (
                <div className="py-12 text-center">
                  <div
                    className="mx-auto inline-block h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent"
                    aria-hidden
                  />
                  <p className="mt-3 text-sm text-blue-100/85">Cargando solicitudes…</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="py-12 text-center px-4">
                  <p className="text-blue-100/80">No hay solicitudes para los filtros actuales.</p>
                  <p className="text-sm text-blue-100/60 mt-2">Prueba ajustar la búsqueda o las fechas.</p>
                  <button type="button" onClick={clearFilters} className="btn-secondary mt-4 text-sm">
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-sky-400/20 overflow-hidden rounded-xl border border-sky-400/25">
                    {requests.map((request) => (
                      <li
                        key={request.id}
                        className="bg-slate-900/30 px-3 py-3.5 transition-colors hover:bg-slate-900/50 sm:px-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-1.5 flex flex-wrap items-center gap-2">
                              <Link
                                to={`/material-requests/${request.id}`}
                                className="text-sm font-semibold text-white hover:text-sky-200 sm:text-base"
                              >
                                {request.request_code || `#${request.id}`}
                              </Link>
                              <MaterialRequestStatusBadge status={request.status} />
                            </div>
                            <p className="text-xs text-blue-100/65 sm:text-sm">
                              <span className="truncate">{request.requester_name}</span>
                              <span className="mx-1.5 text-sky-400/40" aria-hidden>
                                ·
                              </span>
                              <span>{formatRequestDate(request.created_at)}</span>
                              <span className="mx-1.5 text-sky-400/40" aria-hidden>
                                ·
                              </span>
                              <span>
                                {request.items_count} {request.items_count === 1 ? 'ítem' : 'ítems'}
                              </span>
                            </p>
                          </div>
                          <RequestRowActions
                            request={request}
                            isAdmin={isAdmin}
                            userId={user?.id}
                            onApprove={async () => {
                              await approveRequest.mutateAsync({ id: request.id });
                              refetch();
                            }}
                            onCancel={() =>
                              setCancelModal({
                                id: request.id,
                                requestCode: request.request_code || `#${request.id}`,
                                notes: isAdmin
                                  ? 'Cancelado por administrador'
                                  : 'Cancelado por solicitante',
                                wasApproved: request.status === 'approved',
                              })
                            }
                          />
                        </div>
                      </li>
                    ))}
                  </ul>

                  {pagination.totalPages > 1 && (
                    <footer className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-xs sm:text-sm text-blue-50/90 text-center sm:text-left">
                        Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}{' '}
                        solicitudes
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              page: Math.max((prev.page || 1) - 1, 1),
                            }))
                          }
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
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
                          }
                          disabled={pagination.page >= pagination.totalPages}
                          className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50"
                        >
                          Siguiente
                        </button>
                      </div>
                    </footer>
                  )}
                </>
              )}
            </div>
          </div>
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
