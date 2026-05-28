import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ClipboardList, Eye, X } from 'lucide-react';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useApproveLoan, useLoans, useRejectLoan } from '../hooks/useLoans';

const iconActionClass =
  'inline-flex items-center justify-center rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const LoanApproval: React.FC = () => {
  const { data, isLoading, refetch } = useLoans({ status: 'pending', page: 1, limit: 50 });
  const approveLoan = useApproveLoan();
  const rejectLoan = useRejectLoan();
  const loans = data?.loans || [];
  const pendingCount = loans.length;

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6 space-y-6">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="page-heading">Aprobación de préstamos (IT)</h1>
                <p className="page-subheading">
                  Solicitudes pendientes para revisión de soporte técnico.
                </p>
              </div>
              <Link
                to="/loans"
                className="btn-secondary w-full sm:w-auto text-center whitespace-nowrap inline-flex items-center justify-center gap-2"
              >
                <ClipboardList className="h-4 w-4 shrink-0" aria-hidden />
                Ir a préstamos
              </Link>
            </header>

            {!isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="stat-card stat-card--amber">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="stat-card-title">Pendientes de revisión</p>
                      <p className="stat-card-value">{pendingCount}</p>
                    </div>
                    <div className="stat-card-icon stat-card-icon--amber">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="card py-14 text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-sky-400/30 border-t-sky-400" />
                <p className="mt-3 text-sm text-blue-100/85">Cargando solicitudes…</p>
              </div>
            ) : loans.length === 0 ? (
              <div className="mx-auto max-w-lg">
                <div className="content-panel !mb-0 text-center py-10 px-6 sm:py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-500/15 ring-1 ring-sky-400/30 mb-4">
                    <ClipboardList className="w-8 h-8 text-sky-300/80" strokeWidth={1.5} aria-hidden />
                  </div>
                  <p className="text-base font-medium text-blue-50">No hay solicitudes pendientes</p>
                  <p className="mt-2 text-sm text-blue-100/70 leading-relaxed">
                    Cuando un usuario cree una solicitud de préstamo, aparecerá aquí para que puedas
                    revisarla y aprobarla o rechazarla.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link to="/loans" className="btn-primary w-full sm:w-auto">
                      Ver todos los préstamos
                    </Link>
                    <Link to="/loans/history" className="btn-secondary w-full sm:w-auto">
                      Ver historial
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="content-panel !mb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-blue-100/85">
                    <span className="font-semibold text-blue-50">{pendingCount}</span>
                    {pendingCount === 1
                      ? ' solicitud requiere'
                      : ' solicitudes requieren'}{' '}
                    tu revisión. Abrí el detalle para checklist, actas y comentarios.
                  </p>
                </div>

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
                              <p className="text-sm sm:text-base font-medium text-gray-900 font-mono">
                                {loan.request_code || `#${loan.id}`}
                              </p>
                              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-900">
                                Pendiente
                              </span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-x-4 sm:gap-y-1 text-xs sm:text-sm text-gray-600">
                              <span className="truncate">
                                <span className="text-gray-500">Solicitante:</span>{' '}
                                {loan.requester_name || '—'}
                              </span>
                              {loan.target_incident_area_name ? (
                                <span className="truncate">
                                  <span className="text-gray-500">Área:</span>{' '}
                                  {loan.target_incident_area_name}
                                </span>
                              ) : null}
                              <span>
                                <span className="text-gray-500">Inicio:</span>{' '}
                                {formatDate(loan.start_date)}
                              </span>
                              <span>
                                <span className="text-gray-500">Devolución:</span>{' '}
                                {formatDate(loan.expected_return_date)}
                              </span>
                              <span>
                                {loan.items_count === 1
                                  ? '1 equipo'
                                  : `${loan.items_count} equipos`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-end flex-wrap gap-1.5 sm:gap-2 flex-shrink-0">
                            <Link
                              to={`/loans/${loan.id}`}
                              className={`${iconActionClass} text-sky-300 hover:bg-sky-500/20 hover:text-white focus:ring-sky-400`}
                              title="Ver detalle"
                              aria-label="Ver detalle del préstamo"
                            >
                              <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
                            </Link>
                            <button
                              type="button"
                              disabled={approveLoan.isPending}
                              onClick={async () => {
                                await approveLoan.mutateAsync({ id: loan.id });
                                refetch();
                              }}
                              className={`${iconActionClass} text-emerald-300 hover:bg-emerald-500/20 hover:text-white focus:ring-emerald-400 disabled:opacity-50`}
                              title="Aprobar préstamo"
                              aria-label="Aprobar préstamo"
                            >
                              <Check className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                            </button>
                            <button
                              type="button"
                              disabled={rejectLoan.isPending}
                              onClick={async () => {
                                await rejectLoan.mutateAsync({
                                  id: loan.id,
                                  reason: 'Rechazado por IT: validación interna',
                                });
                                refetch();
                              }}
                              className={`${iconActionClass} text-rose-300 hover:bg-rose-500/20 hover:text-white focus:ring-rose-400 disabled:opacity-50`}
                              title="Rechazar préstamo"
                              aria-label="Rechazar préstamo"
                            >
                              <X className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
