import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useConsumableStats } from '../hooks/useConsumables';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const ConsumablesDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: loading } = useConsumableStats();

  useEffect(() => {
    if (user?.role !== 'administrator') {
      navigate('/consumables');
    }
  }, [user, navigate]);

  if (user?.role !== 'administrator') {
    return null;
  }

  if (loading) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando estadísticas...</p>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <p className="text-gray-500">No hay estadísticas disponibles</p>
          </div>
        </PageWrapper>
      </>
    );
  }

  const statusLabels: Record<string, string> = {
    available: 'Disponible',
    low_stock: 'Stock Bajo',
    out_of_stock: 'Sin Stock',
    inactive: 'Inactivo',
  };

  const statusData = stats.byStatus.map((item: { status: string; count: number }) => ({
    name: statusLabels[item.status as keyof typeof statusLabels] || item.status,
    cantidad: item.count,
  }));

  const typeData = stats.byType.map((item: { type: string; count: number }) => ({
    name: item.type,
    cantidad: item.count,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const lowStockCount =
    stats.byStatus.find((s: { status: string; count: number }) => s.status === 'low_stock')?.count || 0;
  const outOfStockCount =
    stats.byStatus.find((s: { status: string; count: number }) => s.status === 'out_of_stock')?.count || 0;

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard de Consumibles</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Consumibles</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Stock Bajo</h3>
                <p className="text-3xl font-bold text-yellow-600">{lowStockCount}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin Stock</h3>
                <p className="text-3xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Consumibles por Estado</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cantidad" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Consumibles por Tipo</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => `${props.name}: ${props.cantidad}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {typeData.map((_: { name: string; cantidad: number }, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};

