import React from 'react';
import { Link } from 'react-router-dom';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useApproveLoan, useLoans, useRejectLoan } from '../hooks/useLoans';

export const LoanApproval: React.FC = () => {
  const { data, isLoading, refetch } = useLoans({ status: 'pending', page: 1, limit: 50 });
  const approveLoan = useApproveLoan();
  const rejectLoan = useRejectLoan();
  const loans = data?.loans || [];

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

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="page-heading">Aprobación de préstamos (IT)</h1>
                <p className="page-subheading">
                  Solicitudes pendientes para revisión de soporte técnico.
                </p>
              </div>
              <Link to="/loans" className="btn-secondary w-full sm:w-auto text-center whitespace-nowrap">
                Ir a préstamos
              </Link>
            </header>

            {isLoading ? (
              <div className="card py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sky-400 border-t-transparent" />
                <p className="mt-3 text-blue-100/85">Cargando solicitudes…</p>
              </div>
            ) : loans.length === 0 ? (
              <div className="card py-12 text-center px-4">
                <p className="text-blue-100/80">No hay solicitudes pendientes.</p>
                <p className="text-sm text-blue-100/60 mt-2">
                  Cuando un usuario cree una solicitud, aparecerá aquí para su aprobación.
                </p>
              </div>
            ) : (
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
                            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-900">
                              Pendiente
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-x-4 sm:gap-y-1 text-xs sm:text-sm text-gray-600">
                            <span className="truncate">Solicitante: {loan.requester_name || '—'}</span>
                            {loan.target_incident_area_name ? (
                              <span className="truncate">Área: {loan.target_incident_area_name}</span>
                            ) : null}
                            <span>Inicio: {formatDate(loan.start_date)}</span>
                            <span>Devolución: {formatDate(loan.expected_return_date)}</span>
                            <span>
                              {loan.items_count === 1 ? '1 equipo' : `${loan.items_count} equipos`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end flex-wrap gap-2 flex-shrink-0">
                          <Link
                            to={`/loans/${loan.id}`}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out whitespace-nowrap"
                          >
                            Ver
                          </Link>
                          <button
                            type="button"
                            disabled={approveLoan.isPending}
                            onClick={async () => {
                              await approveLoan.mutateAsync({ id: loan.id });
                              refetch();
                            }}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:from-green-600 hover:to-green-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out whitespace-nowrap disabled:opacity-50"
                          >
                            {approveLoan.isPending ? 'Aprobando…' : 'Aprobar'}
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
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out whitespace-nowrap disabled:opacity-50"
                          >
                            {rejectLoan.isPending ? 'Rechazando…' : 'Rechazar'}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
