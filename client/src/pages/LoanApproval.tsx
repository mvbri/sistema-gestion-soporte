import React from 'react';
import { Link } from 'react-router-dom';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useApproveLoan, useLoans, useRejectLoan } from '../hooks/useLoans';

export const LoanApproval: React.FC = () => {
  const { data, isLoading, refetch } = useLoans({ status: 'pending', page: 1, limit: 50 });
  const approveLoan = useApproveLoan();
  const rejectLoan = useRejectLoan();

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="py-6 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Aprobación de Préstamos (IT)</h1>
          <p className="text-sm text-gray-600 mb-5">Solicitudes pendientes para revisión de soporte técnico.</p>

          {isLoading ? (
            <div className="py-20 text-center text-gray-600">Cargando solicitudes...</div>
          ) : (
            <div className="rounded-lg border bg-white overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Solicitante</th>
                    <th className="px-3 py-2 text-left">Inicio</th>
                    <th className="px-3 py-2 text-left">Devolución</th>
                    <th className="px-3 py-2 text-left">Items</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.loans?.map((loan) => (
                    <tr key={loan.id} className="border-t">
                      <td className="px-3 py-2">#{loan.id}</td>
                      <td className="px-3 py-2">{loan.requester_name}</td>
                      <td className="px-3 py-2">{loan.start_date}</td>
                      <td className="px-3 py-2">{loan.expected_return_date}</td>
                      <td className="px-3 py-2">{loan.items_count}</td>
                      <td className="px-3 py-2 text-right space-x-2">
                        <Link to={`/loans/${loan.id}`} className="text-blue-600 hover:underline">
                          Ver
                        </Link>
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
                          onClick={async () => {
                            await rejectLoan.mutateAsync({
                              id: loan.id,
                              reason: 'Rechazado por IT: validación interna',
                            });
                            refetch();
                          }}
                        >
                          Rechazar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data?.loans?.length === 0 && (
                <div className="p-6 text-center text-gray-500">No hay solicitudes pendientes.</div>
              )}
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
};
