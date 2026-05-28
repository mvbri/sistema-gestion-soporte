import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEquipmentStats } from '../hooks/useEquipment';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const EquipmentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: loading } = useEquipmentStats();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (user?.role !== 'administrator') {
      navigate('/equipment');
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
          <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
            <div className="py-4 sm:py-6">
              <div className="card py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sky-400 border-t-transparent" />
                <p className="mt-3 text-blue-100/85">Cargando estadísticas…</p>
              </div>
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
          <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
            <div className="py-4 sm:py-6">
              <div className="card py-12 text-center px-4">
                <p className="text-blue-100/80">No hay estadísticas disponibles</p>
                <p className="text-sm text-blue-100/60 mt-2">Intenta más tarde o revisa el inventario.</p>
              </div>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  const statusLabels: Record<string, string> = {
    available: 'Disponible',
    assigned: 'Asignado',
    maintenance: 'En Mantenimiento',
    retired: 'Retirado',
  };

  const statusData = stats.byStatus.map((item: { status: string; count: number }) => ({
    name: statusLabels[item.status as keyof typeof statusLabels] || item.status,
    cantidad: item.count,
  }));

  const typeData = stats.byType.map((item: { type: string; count: number }) => ({
    name: item.type,
    cantidad: item.count,
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  const availableCount = stats.byStatus.find((s: { status: string; count: number }) => s.status === 'available')?.count || 0;
  const assignedCount = stats.byStatus.find((s: { status: string; count: number }) => s.status === 'assigned')?.count || 0;

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="page-heading">Dashboard de inventario</h1>
                <p className="page-subheading">Vista general del inventario de equipos.</p>
              </div>
              <button type="button" onClick={() => navigate('/equipment')} className="btn-secondary w-full sm:w-auto whitespace-nowrap">
                Ir al inventario
              </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="stat-card stat-card--sky">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="stat-card-title">Total de equipos</p>
                    <p className="stat-card-value">{stats.total}</p>
                    <p className="stat-card-hint text-sky-100/70">Equipos registrados en el sistema</p>
                  </div>
                  <div className="stat-card-icon stat-card-icon--sky">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="stat-card stat-card--emerald">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="stat-card-title">Disponibles</p>
                    <p className="stat-card-value">{availableCount}</p>
                    <p className="stat-card-hint text-emerald-100/70">Listos para asignar o prestar</p>
                  </div>
                  <div className="stat-card-icon stat-card-icon--emerald">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="stat-card stat-card--violet">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="stat-card-title">Asignados</p>
                    <p className="stat-card-value">{assignedCount}</p>
                    <p className="stat-card-hint text-violet-100/70">Asignados a usuarios</p>
                  </div>
                  <div className="stat-card-icon stat-card-icon--violet">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <div className="card !p-0 overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-sky-400/15">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Equipos por estado</h3>
                  <p className="mt-1 text-xs text-blue-100/70">Distribución por estado de inventario.</p>
                </div>
                <div className="tickets-list-light bg-white/95 p-4 sm:p-6">
                {statusData.length > 0 ? (
                  <div className="w-full" style={{ height: 'clamp(250px, 30vh, 350px)' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={statusData} 
                        margin={{ 
                          top: 10, 
                          right: windowWidth < 640 ? 5 : 20, 
                          left: windowWidth < 640 ? -10 : 0, 
                          bottom: windowWidth < 640 ? 60 : 40 
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: windowWidth < 640 ? 10 : 12 }}
                          angle={windowWidth < 640 ? -60 : -45}
                          textAnchor="end"
                          height={windowWidth < 640 ? 100 : 80}
                          interval={0}
                        />
                        <YAxis 
                          tick={{ fontSize: windowWidth < 640 ? 10 : 12 }}
                          width={windowWidth < 640 ? 40 : 60}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            fontSize: windowWidth < 640 ? '12px' : '14px'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: windowWidth < 640 ? '12px' : '14px' }}
                        />
                        <Bar 
                          dataKey="cantidad" 
                          fill="#3b82f6" 
                          radius={[6, 6, 0, 0]}
                          name="Cantidad"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center" style={{ height: 'clamp(250px, 30vh, 350px)' }}>
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-gray-400">No hay datos disponibles</p>
                  </div>
                )}
              </div>
              </div>

              <div className="card !p-0 overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-sky-400/15">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Equipos por tipo</h3>
                  <p className="mt-1 text-xs text-blue-100/70">Distribución por tipo de equipo.</p>
                </div>
                <div className="tickets-list-light bg-white/95 p-4 sm:p-6">
                {typeData.length > 0 ? (
                  <div className="w-full" style={{ height: 'clamp(250px, 30vh, 350px)' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={typeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(props: any) => {
                            if (props.cantidad > 0) {
                              const fontSize = windowWidth < 640 ? '10px' : '12px';
                              return (
                                <text 
                                  x={props.x} 
                                  y={props.y} 
                                  fill={props.fill} 
                                  textAnchor={props.textAnchor}
                                  fontSize={fontSize}
                                  fontWeight="500"
                                >
                                  {`${props.name}: ${props.cantidad}`}
                                </text>
                              );
                            }
                            return '';
                          }}
                          outerRadius={windowWidth < 640 ? 60 : windowWidth < 1024 ? 70 : 80}
                          fill="#8884d8"
                          dataKey="cantidad"
                        >
                          {typeData.map((_: { name: string; cantidad: number }, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            fontSize: windowWidth < 640 ? '12px' : '14px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center" style={{ height: 'clamp(250px, 30vh, 350px)' }}>
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    <p className="text-xs sm:text-sm text-gray-400">No hay datos disponibles</p>
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
