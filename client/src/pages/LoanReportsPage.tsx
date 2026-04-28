import React, { useMemo, useState } from 'react';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useLoansSummaryReport } from '../hooks/useLoans';

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
        <div className="py-6 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Reporte de Préstamos</h1>
          <p className="text-sm text-gray-600 mb-4">Métricas de solicitudes, devoluciones, vencidos e incidentes.</p>

          <div className="rounded-lg border bg-white p-4 mb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border px-3 py-2"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border px-3 py-2"
            />
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
            >
              Actualizar
            </button>
          </div>

          {isLoading || !report ? (
            <div className="py-20 text-center text-gray-600">Generando reporte...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="rounded-lg border bg-white p-4">
                  <p className="text-sm text-gray-600">Solicitudes</p>
                  <p className="text-3xl font-bold text-gray-900">{report.totals.total_requests}</p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                  <p className="text-sm text-gray-600">Aprobadas</p>
                  <p className="text-3xl font-bold text-blue-700">{report.totals.approved_count}</p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                  <p className="text-sm text-gray-600">Devueltas</p>
                  <p className="text-3xl font-bold text-emerald-700">{report.totals.returned_count}</p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                  <p className="text-sm text-gray-600">Vencidas</p>
                  <p className="text-3xl font-bold text-red-700">{report.totals.overdue_count}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-lg border bg-white p-4">
                  <h2 className="font-semibold text-gray-900 mb-2">Por estado</h2>
                  <ul className="space-y-1 text-sm">
                    {report.byStatus.map((row) => (
                      <li key={row.status} className="flex justify-between border-b pb-1">
                        <span>{row.status}</span>
                        <span>{row.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border bg-white p-4">
                  <h2 className="font-semibold text-gray-900 mb-2">Top solicitantes</h2>
                  <ul className="space-y-1 text-sm">
                    {report.topRequesters.map((row) => (
                      <li key={row.user_id} className="flex justify-between border-b pb-1">
                        <span>{row.user_name}</span>
                        <span>{row.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </PageWrapper>
    </>
  );
};
