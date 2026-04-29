import React from 'react';
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

export const LoanHistory: React.FC = () => {
  const { user } = useAuth();
  const isAdministrator = user?.role === 'administrator';
  const { data, isLoading } = useLoans(
    isAdministrator ? { page: 1, limit: 50 } : { requester_user_id: user?.id, page: 1, limit: 50 }
  );

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

          {isLoading ? (
            <div className="py-20 text-center text-gray-600">Cargando historial...</div>
          ) : (
            <div className="rounded-lg border bg-white overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    {isAdministrator && <th className="px-3 py-2 text-left">Solicitante</th>}
                    <th className="px-3 py-2 text-left">Estado</th>
                    <th className="px-3 py-2 text-left">Inicio</th>
                    <th className="px-3 py-2 text-left">Devolución esperada</th>
                    <th className="px-3 py-2 text-left">Items</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.loans?.map((loan) => (
                    <tr key={loan.id} className="border-t">
                      <td className="px-3 py-2">#{loan.id}</td>
                      {isAdministrator && <td className="px-3 py-2">{loan.requester_name}</td>}
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            loanStatusBadgeStyles[loan.status]
                          }`}
                        >
                          {loanStatusLabels[loan.status] || loan.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">{loan.start_date}</td>
                      <td className="px-3 py-2">{loan.expected_return_date}</td>
                      <td className="px-3 py-2">{loan.items_count}</td>
                      <td className="px-3 py-2 text-right">
                        <Link to={`/loans/${loan.id}`} className="text-blue-600 hover:underline">
                          Ver detalle
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
          )}
        </div>
      </PageWrapper>
    </>
  );
};
