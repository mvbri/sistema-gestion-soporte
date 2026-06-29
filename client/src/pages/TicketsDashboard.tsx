import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTicketStats } from '../hooks/useTickets';
import { TicketLifecycleSummaryCards } from '../components/tickets/TicketLifecycleSummaryCards';
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

const DEFAULT_ESTADO_ICON =
  'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';

const ESTADO_ICON_PATHS: Record<string, string> = {
  abierto:
    'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4',
  asignado:
    'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  'en proceso':
    'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  resuelto: DEFAULT_ESTADO_ICON,
  cerrado:
    'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
};

function getEstadoIconPath(nombre: string): string {
  const key = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  return ESTADO_ICON_PATHS[key] ?? DEFAULT_ESTADO_ICON;
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

  if (isError) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
            <div className="py-4 sm:py-6">
              <div className="card py-10 text-center px-4">
                <p className="text-red-200 font-semibold">Error al cargar estadísticas</p>
                <p className="text-blue-100/80 mt-2">
                  {error?.message || 'No se pudieron cargar las estadísticas'}
                </p>
                <button type="button" className="btn-secondary mt-5" onClick={() => refetch()}>
                  Reintentar
                </button>
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
                <p className="text-sm text-blue-100/60 mt-2">Intenta ajustar el rango de fechas.</p>
              </div>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  const totalPorEstado = stats.porEstado.reduce((sum, estado) => sum + (estado.cantidad || 0), 0);
  const totalPorCategoria = stats.porCategoria.reduce((sum, categoria) => sum + (categoria.cantidad || 0), 0);

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="page-heading">Dashboard de tickets</h1>
                <p className="page-subheading">Resumen estadístico del sistema de tickets.</p>
              </div>
              <button type="button" onClick={applyRange} className="btn-primary w-full sm:w-auto whitespace-nowrap">
                Actualizar
              </button>
            </header>

            <div className="content-panel mb-6">
              <div className="flex items-center gap-2 mb-5">
                <svg className="w-5 h-5 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h2 className="text-lg sm:text-xl font-semibold text-white">Rango de fechas</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div className="min-w-0">
                  <label className="label-field">Desde</label>
                  <input
                    type="date"
                    value={draftFrom}
                    onChange={(e) => setDraftFrom(e.target.value)}
                    className="input-field w-full py-2.5 [color-scheme:dark]"
                  />
                </div>
                <div className="min-w-0">
                  <label className="label-field">Hasta</label>
                  <input
                    type="date"
                    value={draftTo}
                    onChange={(e) => setDraftTo(e.target.value)}
                    className="input-field w-full py-2.5 [color-scheme:dark]"
                  />
                </div>
                <div className="lg:col-span-2 rounded-xl border border-sky-400/20 bg-slate-900/25 px-4 py-3 text-xs sm:text-sm text-blue-100/80 flex items-center">
                  Máximo 366 días. Por defecto: últimos 30 días.
                </div>
              </div>
            </div>

            <div className="mb-6 sm:mb-8">
              <h2 className="mb-3 text-sm sm:text-base font-semibold text-white">Actividad del período</h2>
              {stats.period && (
                <TicketLifecycleSummaryCards
                  metrics={{
                    tickets_creados: stats.tickets_creados ?? stats.total,
                    tickets_resueltos: stats.tickets_resueltos ?? 0,
                    tickets_cerrados: stats.tickets_cerrados ?? 0,
                    promedio_horas_hasta_resolucion: stats.promedio_horas_hasta_resolucion ?? null,
                    promedio_horas_hasta_cierre: stats.promedio_horas_hasta_cierre ?? null,
                  }}
                  period={stats.period}
                />
              )}
            </div>

            <div className="mb-6 sm:mb-8">
              <h2 className="mb-3 text-sm sm:text-base font-semibold text-white">Resumen general</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card stat-card--sky">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="stat-card-title">Total de tickets</p>
                      <p className="stat-card-value">{stats.total}</p>
                      <p className="stat-card-hint text-sky-100/70">Tickets en el sistema</p>
                    </div>
                    <div className="stat-card-icon stat-card-icon--sky">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="mb-3 text-sm sm:text-base font-semibold text-white">Estado actual de tickets creados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.porEstado.length === 0 ? (
                <div className="stat-card stat-card--emerald">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="stat-card-title">Estados</p>
                      <p className="stat-card-value">0</p>
                      <p className="stat-card-hint text-emerald-100/70">Sin estados disponibles</p>
                    </div>
                    <div className="stat-card-icon stat-card-icon--emerald">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                stats.porEstado.map((estado) => (
                  <div key={estado.estado_id} className="stat-card stat-card--emerald">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="stat-card-title">{estado.estado_nombre}</p>
                        <p className="stat-card-value">{estado.cantidad}</p>
                        <p className="stat-card-hint text-emerald-100/70">Creados en el rango</p>
                      </div>
                      <div className="stat-card-icon stat-card-icon--emerald">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getEstadoIconPath(estado.estado_nombre)} />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="mb-3 text-sm sm:text-base font-semibold text-white">Tickets por categoría</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.porCategoria.length === 0 ? (
                <div className="stat-card stat-card--violet">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="stat-card-title">Categorías</p>
                      <p className="stat-card-value">0</p>
                      <p className="stat-card-hint text-violet-100/70">Sin categorías disponibles</p>
                    </div>
                    <div className="stat-card-icon stat-card-icon--violet">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                stats.porCategoria.map((categoria) => (
                  <div key={categoria.id} className="stat-card stat-card--violet">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="stat-card-title truncate">{categoria.nombre}</p>
                        <p className="stat-card-value">{categoria.cantidad}</p>
                        <p className="stat-card-hint text-violet-100/70">Tickets en esta categoría</p>
                      </div>
                      <div className="stat-card-icon stat-card-icon--violet">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="mb-3 text-sm sm:text-base font-semibold text-white">Tickets por dirección</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {!stats.porDireccion || stats.porDireccion.length === 0 ? (
                <div className="stat-card stat-card--sky">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="stat-card-title">Direcciones</p>
                      <p className="stat-card-value">0</p>
                      <p className="stat-card-hint text-sky-100/70">Sin direcciones disponibles</p>
                    </div>
                    <div className="stat-card-icon stat-card-icon--sky">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21s-7-4.35-7-11a7 7 0 1114 0c0 6.65-7 11-7 11z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                stats.porDireccion.map((direccion) => (
                  <div key={direccion.id} className="stat-card stat-card--sky">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="stat-card-title truncate">{direccion.nombre}</p>
                        <p className="stat-card-value">{direccion.cantidad}</p>
                        <p className="stat-card-hint text-sky-100/70">Tickets en esta dirección</p>
                      </div>
                      <div className="stat-card-icon stat-card-icon--sky">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="card !p-0 overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-sky-400/15">
                <h3 className="text-base sm:text-lg font-semibold text-white">Gráfico: tickets por estado</h3>
                <p className="mt-1 text-xs text-blue-100/70">Distribución del periodo seleccionado.</p>
              </div>
              <div className="tickets-list-light bg-white/95 p-4 sm:p-6">
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
            </div>

            <div className="card !p-0 overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-sky-400/15">
                <h3 className="text-base sm:text-lg font-semibold text-white">Gráfico: tickets por prioridad</h3>
                <p className="mt-1 text-xs text-blue-100/70">Participación por prioridad.</p>
              </div>
              <div className="tickets-list-light bg-white/95 p-4 sm:p-6">
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
          </div>

          <div className="card !p-0 overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-sky-400/15">
              <h3 className="text-base sm:text-lg font-semibold text-white">Gráfico: tickets por categoría</h3>
              <p className="mt-1 text-xs text-blue-100/70">Volumen por categoría.</p>
            </div>
            <div className="tickets-list-light bg-white/95 p-4 sm:p-6">
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
        </div>
      </PageWrapper>
    </>
  );
};
