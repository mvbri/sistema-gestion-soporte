import React from 'react';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useLoans } from '../hooks/useLoans';
import { useAuth } from '../hooks/useAuth';

export const LoanHistory: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading } = useLoans({ requester_user_id: user?.id, page: 1, limit: 50 });

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="py-6 max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Historial de Préstamos</h1>
          <p className="text-sm text-gray-600 mb-5">Historial del usuario y estado de cada solicitud.</p>

          {isLoading ? (
            <div className="py-20 text-center text-gray-600">Cargando historial...</div>
          ) : (
            <div className="rounded-lg border bg-white overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Estado</th>
                    <th className="px-3 py-2 text-left">Inicio</th>
                    <th className="px-3 py-2 text-left">Devolución esperada</th>
                    <th className="px-3 py-2 text-left">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.loans?.map((loan) => (
                    <tr key={loan.id} className="border-t">
                      <td className="px-3 py-2">#{loan.id}</td>
                      <td className="px-3 py-2">{loan.status}</td>
                      <td className="px-3 py-2">{loan.start_date}</td>
                      <td className="px-3 py-2">{loan.expected_return_date}</td>
                      <td className="px-3 py-2">{loan.items_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data?.loans?.length === 0 && (
                <div className="p-6 text-center text-gray-500">No tienes préstamos registrados.</div>
              )}
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
};
