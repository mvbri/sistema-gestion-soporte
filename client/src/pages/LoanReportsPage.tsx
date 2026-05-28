import React, { useMemo, useState } from 'react';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useLoansSummaryReport } from '../hooks/useLoans';

const loanStatusLabels: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  delivered: 'Entregado',
  overdue: 'Vencido',
  returned: 'Devuelto',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
};

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

export const LoanReportsPage: React.FC = () => {
  const defaults = useMemo(() => defaultDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaults.from);
  const [dateTo, setDateTo] = useState(defaults.to);
  const { data: report, isLoading, refetch } = useLoansSummaryReport(dateFrom, dateTo);

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="page-heading">Reporte de préstamos</h1>
                <p className="page-subheading">Métricas de solicitudes, devoluciones, vencidos e incidentes.</p>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="btn-primary text-sm sm:text-base whitespace-nowrap"
                disabled={isLoading}
              >
                {isLoading ? 'Actualizando…' : 'Actualizar'}
              </button>
            </header>

            <div className="content-panel mb-6">
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
                    <span>Desde</span>
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="input-field w-full py-2.5 [color-scheme:dark]"
                  />
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
                    <span>Hasta</span>
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="input-field w-full py-2.5 [color-scheme:dark]"
                  />
                </div>

                <div className="lg:col-span-2 rounded-xl border border-sky-400/20 bg-slate-900/25 px-4 py-3 text-xs sm:text-sm text-blue-100/80 flex items-center">
                  Usa el rango de fechas para actualizar el resumen del periodo.
                </div>
              </div>
            </div>

            {isLoading || !report ? (
              <div className="card py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sky-400 border-t-transparent" />
                <p className="mt-3 text-blue-100/85">Generando reporte…</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="stat-card stat-card--sky">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="stat-card-title">Solicitudes</p>
                        <p className="stat-card-value">{report.totals.total_requests}</p>
                      </div>
                      <div className="stat-card-icon stat-card-icon--sky">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="stat-card stat-card--violet">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="stat-card-title">Aprobadas</p>
                        <p className="stat-card-value">{report.totals.approved_count}</p>
                      </div>
                      <div className="stat-card-icon stat-card-icon--violet">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="stat-card stat-card--emerald">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="stat-card-title">Devueltas</p>
                        <p className="stat-card-value">{report.totals.returned_count}</p>
                      </div>
                      <div className="stat-card-icon stat-card-icon--emerald">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8 8 0 104.582 9m0 0H9"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="stat-card stat-card--amber">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="stat-card-title">Vencidas</p>
                        <p className="stat-card-value">{report.totals.overdue_count}</p>
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <section className="card !p-0 overflow-hidden">
                    <div className="px-5 sm:px-6 py-4 border-b border-sky-400/15">
                      <h2 className="text-base font-semibold text-white sm:text-lg">Por estado</h2>
                      <p className="mt-1 text-xs text-blue-100/70">Distribución del periodo seleccionado.</p>
                    </div>
                    <ul className="divide-y divide-sky-400/15">
                      {report.byStatus.map((row) => (
                        <li
                          key={row.status}
                          className="flex items-center justify-between gap-3 px-5 sm:px-6 py-3 bg-slate-900/20"
                        >
                          <span className="text-sm text-blue-50/90">
                            {loanStatusLabels[row.status] || row.status}
                          </span>
                          <span className="text-sm font-semibold text-white tabular-nums">{row.count}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="card !p-0 overflow-hidden">
                    <div className="px-5 sm:px-6 py-4 border-b border-sky-400/15">
                      <h2 className="text-base font-semibold text-white sm:text-lg">Top solicitantes</h2>
                      <p className="mt-1 text-xs text-blue-100/70">Usuarios con más solicitudes en el periodo.</p>
                    </div>
                    <ul className="divide-y divide-sky-400/15">
                      {report.topRequesters.map((row) => (
                        <li
                          key={row.user_id}
                          className="flex items-center justify-between gap-3 px-5 sm:px-6 py-3 bg-slate-900/20"
                        >
                          <span className="text-sm text-blue-50/90 truncate">{row.user_name}</span>
                          <span className="text-sm font-semibold text-white tabular-nums">{row.count}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
