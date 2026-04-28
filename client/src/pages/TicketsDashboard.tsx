import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTicketStats } from '../hooks/useTickets';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { TicketStats } from '../types';

function formatDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function defaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return { from: formatDateInput(from), to: formatDateInput(to) };
}

export const TicketsDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const defaults = useMemo(() => defaultDateRange(), []);
  const [draftFrom, setDraftFrom] = useState(defaults.from);
  const [draftTo, setDraftTo] = useState(defaults.to);
  const [appliedFrom, setAppliedFrom] = useState(defaults.from);
  const [appliedTo, setAppliedTo] = useState(defaults.to);

  const {
    data: stats,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useTicketStats(appliedFrom, appliedTo) as {
    data: TicketStats | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
  };

  useEffect(() => {
    if (user?.role !== 'administrator') {
      navigate('/tickets');
    }
  }, [user, navigate]);

  if (user?.role !== 'administrator') {
    return null;
  }

  const applyRange = () => {
    if (!draftFrom || !draftTo || draftFrom > draftTo) {
      return;
    }
    setAppliedFrom(draftFrom);
    setAppliedTo(draftTo);
  };

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

  if (isError) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error?.message || 'No se pudieron cargar las estadísticas'}
            <button type="button" className="ml-3 underline" onClick={() => refetch()}>
              Reintentar
            </button>
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
  
  const totalPorEstado = stats.porEstado.reduce((sum, estado) => sum + (estado.cantidad || 0), 0);
  const totalPorCategoria = stats.porCategoria.reduce((sum, categoria) => sum + (categoria.cantidad || 0), 0);
  const totalPorDireccion = stats.porDireccion?.reduce((sum, direccion) => sum + (direccion.cantidad || 0), 0) ?? 0;

  return (
    <>
      <MainNavbar />
      <PageWrapper>
      <div className="py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 002 2h2a2 2 0 002-2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Dashboard de Tickets</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Resumen estadístico del sistema de tickets</p>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-3">Rango de fechas</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="flex flex-col text-xs text-gray-600 sm:flex-1">
                Desde
                <input
                  type="date"
                  value={draftFrom}
                  onChange={(e) => setDraftFrom(e.target.value)}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                />
              </label>
              <label className="flex flex-col text-xs text-gray-600 sm:flex-1">
                Hasta
                <input
                  type="date"
                  value={draftTo}
                  onChange={(e) => setDraftTo(e.target.value)}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
                />
              </label>
              <button
                type="button"
                onClick={applyRange}
                disabled={!draftFrom || !draftTo || draftFrom > draftTo}
                className="mt-0 sm:mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Actualizar
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">Máximo 366 días. Por defecto: últimos 30 días.</p>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="mb-3 text-sm sm:text-base font-semibold text-gray-800">Resumen General</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Total de Tickets</h3>
                  <div className="p-1.5 bg-blue-500 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-blue-700">{stats.total}</p>
                <p className="text-xs text-gray-600 mt-1">Tickets en el sistema</p>
              </div>
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="mb-3 text-sm sm:text-base font-semibold text-gray-800">Tickets por Estado</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
            {stats.porEstado.length === 0 ? (
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Estados</h3>
                  <div className="p-1.5 bg-green-500 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-green-700">0</p>
                <p className="text-xs text-gray-600 mt-1">Sin estados disponibles</p>
              </div>
            ) : (
              stats.porEstado.map((estado, index) => (
                <div
                  key={estado.estado_id}
                  className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-700">{estado.estado_nombre}</h3>
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: COLORS[(index + 1) % COLORS.length] }}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-green-700">{estado.cantidad}</p>
                  <p className="text-xs text-gray-600 mt-1">Tickets en este estado</p>
                </div>
              ))
            )}
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="mb-3 text-sm sm:text-base font-semibold text-gray-800">Tickets por Categoría</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
            {stats.porCategoria.length === 0 ? (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Categorías</h3>
                  <div className="p-1.5 bg-purple-500 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-700">0</p>
                <p className="text-xs text-gray-600 mt-1">Sin categorías disponibles</p>
              </div>
            ) : (
              stats.porCategoria.map((categoria, index) => (
                <div
                  key={categoria.id}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-700">{categoria.nombre}</h3>
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-700">{categoria.cantidad}</p>
                  <p className="text-xs text-gray-600 mt-1">Tickets en esta categoría</p>
                </div>
              ))
            )}
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="mb-3 text-sm sm:text-base font-semibold text-gray-800">Tickets por Dirección</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
            {!stats.porDireccion || stats.porDireccion.length === 0 ? (
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Direcciones</h3>
                  <div className="p-1.5 bg-cyan-500 rounded-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a2 2 0 010-2.828l4.243-4.243m0 11.314a8 8 0 1111.314-11.314 8 8 0 01-11.314 11.314z" />
                    </svg>
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-cyan-700">0</p>
                <p className="text-xs text-gray-600 mt-1">Sin direcciones disponibles</p>
              </div>
            ) : (
              stats.porDireccion.map((direccion, index) => (
                <div
                  key={direccion.id}
                  className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-700">{direccion.nombre}</h3>
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: COLORS[(index + 3) % COLORS.length] }}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2m0 18l6-3m-6 3V2m6 15l6 3m-6-3V5m6 15V8m0 12l-6-3" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-cyan-700">{direccion.cantidad}</p>
                  <p className="text-xs text-gray-600 mt-1">Tickets en esta dirección</p>
                </div>
              ))
            )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 002 2h2a2 2 0 002-2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Tickets por Estado</h3>
              </div>
              {stats.porEstado.length === 0 || totalPorEstado === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 sm:h-80 text-gray-400">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 002 2h2a2 2 0 002-2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-sm sm:text-base">No hay datos disponibles</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280} className="sm:h-80">
                  <BarChart data={stats.porEstado} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="estado_nombre" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                    <Bar dataKey="cantidad" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Tickets por Prioridad</h3>
              </div>
              {stats.porPrioridad.length === 0 || stats.porPrioridad.reduce((sum, p) => sum + (p.cantidad || 0), 0) === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 sm:h-80 text-gray-400">
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <p className="text-sm sm:text-base">No hay datos disponibles</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280} className="sm:h-80">
                  <PieChart>
                    <Pie
                      data={stats.porPrioridad}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => {
                        const percent = entry?.percent ?? 0;
                        if (percent < 0.05) return '';
                        return `${entry?.cantidad}`;
                      }}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="cantidad"
                    >
                      {stats.porPrioridad.map((_: unknown, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value?: number) => [`${value ?? 0} tickets`, 'Cantidad']}
                      labelFormatter={(label: unknown) => String(label ?? '')}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                    <Legend 
                      formatter={(_value: string, entry: any) => {
                        const { nombre, cantidad } = entry.payload as { nombre: string; cantidad: number };
                        return `${nombre} (${cantidad})`;
                      }}
                      wrapperStyle={{ fontSize: '14px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Tickets por Categoría</h3>
            </div>
            {stats.porCategoria.length === 0 || totalPorCategoria === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 sm:h-80 text-gray-400">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <p className="text-sm sm:text-base">No hay datos disponibles</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280} className="sm:h-80">
                <BarChart data={stats.porCategoria} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="nombre" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '14px' }} />
                  <Bar dataKey="cantidad" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      </PageWrapper>
    </>
  );
};
