import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToolStats } from '../hooks/useTools';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const ToolsDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading: loading } = useToolStats();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    if (user?.role !== 'administrator') {
      navigate('/tools');
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600 text-lg font-medium">Cargando estadísticas...</p>
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
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="mt-4 text-gray-500 text-lg">No hay estadísticas disponibles</p>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  const statusLabels: Record<string, string> = {
    available: 'Disponible',
    assigned: 'Asignada',
    maintenance: 'En Mantenimiento',
    inactive: 'Inactiva',
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

  const assignedCount =
    stats.byStatus.find((s: { status: string; count: number }) => s.status === 'assigned')?.count || 0;
  const maintenanceCount =
    stats.byStatus.find((s: { status: string; count: number }) => s.status === 'maintenance')?.count || 0;

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="py-4 sm:py-6">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="mb-4 sm:mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Dashboard de Herramientas</h1>
                </div>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 ml-0 sm:ml-11">Vista general del inventario de herramientas</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-lg sm:hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-1">Total de Herramientas</h3>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mt-1 sm:mt-2">Herramientas registradas</p>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-lg sm:hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-green-500 rounded-lg flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-1">Asignadas</h3>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-600">{assignedCount}</p>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mt-1 sm:mt-2">En uso</p>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-lg sm:hover:shadow-xl transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="p-1.5 sm:p-2 bg-amber-500 rounded-lg flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-1">En Mantenimiento</h3>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-amber-600">{maintenanceCount}</p>
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 mt-1 sm:mt-2">Requieren atención</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200 p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">Herramientas por Estado</h3>
                </div>
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

              <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg border border-gray-200 p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
                  <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">Herramientas por Tipo</h3>
                </div>
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
      </PageWrapper>
    </>
  );
};
