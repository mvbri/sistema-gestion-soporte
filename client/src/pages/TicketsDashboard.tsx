import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTicketStats } from '../hooks/useTickets';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import type { TicketStats } from '../types';

export const TicketsDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: loading } = useTicketStats() as { data: TicketStats | undefined; isLoading: boolean };

  useEffect(() => {
    if (user?.role !== 'administrator') {
      navigate('/tickets');
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <>
      <MainNavbar />
      <PageWrapper>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Tickets</h1>
          <p className="text-gray-600 mt-2">Resumen estadístico del sistema de tickets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total de Tickets</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Por Estado</h3>
            <p className="text-3xl font-bold text-green-600">{stats.porEstado.length}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Por Categoría</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.porCategoria.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tickets por Estado</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.porEstado}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="estado_nombre" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="cantidad" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tickets por Prioridad</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.porPrioridad}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(entry: { nombre: string; cantidad: number; percent?: number }) => {
                    const percent = entry.percent || 0;
                    if (percent < 0.05) return '';
                    return `${entry.nombre}: ${entry.cantidad}`;
                  }}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {stats.porPrioridad.map((_: unknown, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} tickets`, 'Cantidad']}
                  labelFormatter={(label: string) => label}
                />
                <Legend 
                  formatter={(_value: string, entry: any) => {
                    const { nombre, cantidad } = entry.payload as { nombre: string; cantidad: number };
                    return `${nombre} (${cantidad})`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tickets por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.porCategoria}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cantidad" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        </div>
      </div>
      </PageWrapper>
    </>
  );
};
