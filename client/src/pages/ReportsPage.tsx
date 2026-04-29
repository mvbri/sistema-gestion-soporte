import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../hooks/useAuth';
import { useTicketsPeriodReport } from '../hooks/useReports';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import type { TicketsPeriodReport } from '../types';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

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

function csvEscape(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? '' : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function downloadTicketsReportCsv(report: TicketsPeriodReport): void {
  const rows: string[][] = [];
  rows.push(['Sección', 'Etiqueta', 'Valor']);
  rows.push(['Periodo', 'Desde', report.period.date_from]);
  rows.push(['Periodo', 'Hasta', report.period.date_to]);
  rows.push(['Resumen', 'Tickets creados', String(report.tickets_creados)]);
  rows.push(['Resumen', 'Tickets cerrados', String(report.tickets_cerrados)]);
  rows.push([
    'Resumen',
    'Promedio horas resolución',
    report.promedio_horas_resolucion === null ? '' : String(report.promedio_horas_resolucion),
  ]);
  report.porEstado.forEach((e) => {
    rows.push(['Por estado', e.estado_nombre, String(e.cantidad)]);
  });
  report.porCategoria.forEach((c) => {
    rows.push(['Por categoría', c.nombre, String(c.cantidad)]);
  });
  report.porPrioridad.forEach((p) => {
    rows.push(['Por prioridad', p.nombre, String(p.cantidad)]);
  });
  report.porArea.forEach((a) => {
    rows.push(['Por área', a.nombre, String(a.cantidad)]);
  });
  report.cierresPorTecnico.forEach((t) => {
    rows.push(['Cierres por técnico', t.tecnico_nombre, String(t.cantidad)]);
  });
  const body = rows.map((r) => r.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte_tickets_${report.period.date_from}_${report.period.date_to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const COMPANY_NAME = 'Sistema de Gestion de Soporte';
const COMPANY_LOGO_PATH = '/alcado.png';

function buildReportFilename(report: TicketsPeriodReport, extension: 'csv' | 'pdf'): string {
  return `reporte_tickets_${report.period.date_from}_${report.period.date_to}.${extension}`;
}

function toPdfTableRows(items: Array<{ name: string; value: number }>): string[][] {
  return items.map((item) => [item.name, String(item.value)]);
}

async function loadImageAsDataUrl(path: string): Promise<string | null> {
  try {
    const response = await fetch(path);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function downloadTicketsReportPdf(report: TicketsPeriodReport): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const marginLeft = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  let startY = 40;

  const logoDataUrl = await loadImageAsDataUrl(COMPANY_LOGO_PATH);
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', marginLeft, startY, 120, 40);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(COMPANY_NAME, pageWidth - 40, startY + 18, { align: 'right' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte de tickets por periodo', pageWidth - 40, startY + 36, { align: 'right' });

  startY += 60;
  autoTable(doc, {
    startY,
    head: [['Metrica', 'Valor']],
    body: [
      ['Desde', report.period.date_from],
      ['Hasta', report.period.date_to],
      ['Tickets creados', String(report.tickets_creados)],
      ['Tickets cerrados', String(report.tickets_cerrados)],
      [
        'Promedio horas resolucion',
        report.promedio_horas_resolucion === null ? 'N/A' : String(report.promedio_horas_resolucion),
      ],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  startY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY
    ? ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? startY) + 20
    : startY + 20;

  const sections = [
    {
      title: 'Tickets por estado',
      rows: toPdfTableRows(report.porEstado.map((e) => ({ name: e.estado_nombre, value: e.cantidad }))),
    },
    {
      title: 'Tickets por categoria',
      rows: toPdfTableRows(report.porCategoria.map((c) => ({ name: c.nombre, value: c.cantidad }))),
    },
    {
      title: 'Tickets por prioridad',
      rows: toPdfTableRows(report.porPrioridad.map((p) => ({ name: p.nombre, value: p.cantidad }))),
    },
    {
      title: 'Tickets por area',
      rows: toPdfTableRows(report.porArea.map((a) => ({ name: a.nombre, value: a.cantidad }))),
    },
    {
      title: 'Cierres por tecnico',
      rows: toPdfTableRows(
        report.cierresPorTecnico.map((t) => ({ name: t.tecnico_nombre, value: t.cantidad }))
      ),
    },
  ];

  sections.forEach((section) => {
    if (section.rows.length === 0) return;
    autoTable(doc, {
      startY,
      head: [[section.title, 'Cantidad']],
      body: section.rows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [74, 111, 165] },
      columnStyles: {
        1: { halign: 'right' },
      },
      margin: { left: marginLeft, right: marginLeft },
    });
    startY = ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? startY) + 16;
  });

  doc.save(buildReportFilename(report, 'pdf'));
}

/** Paleta para series cuando el color de BD no es usable (vacío, negro, etc.). */
const CHART_PALETTE = [
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#db2777',
  '#0d9488',
  '#4f46e5',
  '#ea580c',
  '#0891b2',
];

function normalizeHex7(c: string): string | null {
  let s = c.trim();
  if (!s.startsWith('#')) return null;
  if (s.length === 4) {
    s = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  if (s.length !== 7) return null;
  return s.toLowerCase();
}

/** Color tal como está en configuración (hex con/sin #, rgb/rgba); null si viene vacío o ilegible. */
function normalizeColorForChart(color: string | undefined | null): string | null {
  if (color === undefined || color === null) return null;
  const raw = color.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower === 'black') return '#000000';
  if (lower === 'white') return '#ffffff';
  if (!raw.startsWith('#') && /^[0-9a-fA-F]{6}$/i.test(raw)) {
    return `#${raw.toLowerCase()}`;
  }
  if (raw.startsWith('#')) {
    const norm = normalizeHex7(raw);
    if (norm) return norm;
    return null;
  }
  if (/^rgba?\(\s*\d+/i.test(raw)) return raw;
  return null;
}

/** Barras por estado: siempre el color del estado en BD; paleta solo si no hay color. */
function fillForTicketState(estado_color: string | undefined, index: number): string {
  const n = normalizeColorForChart(estado_color);
  if (n) return n;
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

/** Pastel por prioridad: color de la prioridad en BD; si falta, colores por nombre. */
function fillForPriority(
  prioridad_color: string | undefined,
  nombre: string,
  index: number
): string {
  const n = normalizeColorForChart(prioridad_color);
  if (n) return n;
  return colorForPriorityName(nombre, index);
}

function colorForPriorityName(nombre: string, index: number): string {
  const n = nombre.toLowerCase();
  if (n.includes('urgente')) return '#ef4444';
  if (n.includes('alta')) return '#dc2626';
  if (n.includes('media')) return '#eab308';
  if (n.includes('baja')) return '#22c55e';
  return CHART_PALETTE[index % CHART_PALETTE.length];
}

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const defaults = useMemo(() => defaultDateRange(), []);
  const [draftFrom, setDraftFrom] = useState(defaults.from);
  const [draftTo, setDraftTo] = useState(defaults.to);
  const [appliedFrom, setAppliedFrom] = useState(defaults.from);
  const [appliedTo, setAppliedTo] = useState(defaults.to);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
  } = useTicketsPeriodReport(appliedFrom, appliedTo);

  useEffect(() => {
    if (user?.role !== 'administrator') {
      navigate('/dashboard');
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

  const totalPorEstado = report?.porEstado.reduce((s, e) => s + (e.cantidad || 0), 0) ?? 0;
  const totalPorCategoria = report?.porCategoria.reduce((s, c) => s + (c.cantidad || 0), 0) ?? 0;
  const firstEstadoColor = report?.porEstado?.length
    ? normalizeColorForChart(report.porEstado[0].estado_color)
    : null;
  const estadoBarFallbackFill = firstEstadoColor ?? CHART_PALETTE[0];

  const handleExportPdf = async (): Promise<void> => {
    if (!report || isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      await downloadTicketsReportPdf(report);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="py-4 sm:py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reportes</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Tickets creados en el período seleccionado, cierres y tiempos de resolución
                </p>
              </div>
              {report && (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isExportingPdf ? 'Generando PDF...' : 'Exportar PDF'}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadTicketsReportCsv(report)}
                    className="inline-flex items-center justify-center rounded-lg bg-[#4A6FA5] px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-[#3d5d8c] transition-colors"
                  >
                    Exportar CSV
                  </button>
                </div>
              )}
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
              <p className="mt-2 text-xs text-gray-500">
                Máximo 366 días. Por defecto: últimos 30 días.
              </p>
            </div>

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-24 text-gray-600">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
                <p className="mt-2">Generando reporte...</p>
              </div>
            )}

            {isError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {(error as Error)?.message || 'No se pudo cargar el reporte'}
                <button type="button" className="ml-3 underline" onClick={() => refetch()}>
                  Reintentar
                </button>
              </div>
            )}

            {!isLoading && !isError && report && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                  <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-5 shadow-md">
                    <p className="text-sm font-semibold text-gray-700">Tickets creados</p>
                    <p className="mt-2 text-3xl font-bold text-blue-700">
                      {report.tickets_creados}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">En el período (fecha de creación)</p>
                  </div>
                  <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-5 shadow-md">
                    <p className="text-sm font-semibold text-gray-700">Tickets cerrados</p>
                    <p className="mt-2 text-3xl font-bold text-green-700">
                      {report.tickets_cerrados}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      Cerrados en el período (fecha de cierre)
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-5 shadow-md">
                    <p className="text-sm font-semibold text-gray-700">
                      Tiempo medio de resolución
                    </p>
                    <p className="mt-2 text-3xl font-bold text-amber-800">
                      {report.promedio_horas_resolucion === null
                        ? '—'
                        : `${report.promedio_horas_resolucion} h`}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      Solo tickets cerrados en el período
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-md">
                    <p className="text-sm font-semibold text-gray-700">Período</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">
                      {report.period.date_from}
                      <span className="mx-1 text-gray-500">→</span>
                      {report.period.date_to}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 mb-6">
                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Creados por estado</h2>
                    {report.porEstado.length === 0 || totalPorEstado === 0 ? (
                      <p className="py-16 text-center text-gray-400">Sin datos en este período</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={report.porEstado}
                          margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="estado_nombre"
                            tick={{ fontSize: 11 }}
                            angle={-35}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar
                            dataKey="cantidad"
                            fill={estadoBarFallbackFill}
                            radius={[8, 8, 0, 0]}
                          >
                            {report.porEstado.map((entry, index) => (
                              <Cell
                                key={entry.estado_id}
                                fill={fillForTicketState(entry.estado_color, index)}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                      Creados por prioridad
                    </h2>
                    {report.porPrioridad.every((p) => !p.cantidad) ? (
                      <p className="py-16 text-center text-gray-400">Sin datos en este período</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={report.porPrioridad.filter((p) => p.cantidad > 0)}
                            cx="50%"
                            cy="50%"
                            dataKey="cantidad"
                            nameKey="nombre"
                            outerRadius={100}
                            fill={CHART_PALETTE[0]}
                            stroke="#f3f4f6"
                            strokeWidth={1}
                            labelLine={false}
                            label={({ payload }) =>
                              payload &&
                              typeof payload.cantidad === 'number' &&
                              payload.cantidad > 0
                                ? String(payload.cantidad)
                                : ''
                            }
                          >
                            {report.porPrioridad
                              .filter((p) => p.cantidad > 0)
                              .map((entry, index) => (
                                <Cell
                                  key={entry.id}
                                  fill={fillForPriority(entry.color, entry.nombre, index)}
                                />
                              ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="mb-6 rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    Creados por categoría
                  </h2>
                  {report.porCategoria.length === 0 || totalPorCategoria === 0 ? (
                    <p className="py-16 text-center text-gray-400">Sin datos en este período</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart
                        data={report.porCategoria}
                        margin={{ top: 8, right: 8, left: 0, bottom: 56 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="nombre"
                          tick={{ fontSize: 11 }}
                          angle={-35}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="cantidad" radius={[8, 8, 0, 0]}>
                          {report.porCategoria.map((c, index) => (
                            <Cell key={c.id} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                      Creados por área de incidente
                    </h2>
                    {report.porArea.every((a) => !a.cantidad) ? (
                      <p className="py-16 text-center text-gray-400">Sin datos en este período</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={report.porArea}
                          margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="nombre"
                            tick={{ fontSize: 11 }}
                            angle={-35}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar dataKey="cantidad" radius={[8, 8, 0, 0]}>
                            {report.porArea.map((a, index) => (
                              <Cell
                                key={a.id}
                                fill={CHART_PALETTE[(index + 2) % CHART_PALETTE.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                      Cierres por técnico
                    </h2>
                    {report.cierresPorTecnico.length === 0 ? (
                      <p className="py-16 text-center text-gray-400">Sin cierres en este período</p>
                    ) : (
                      <ResponsiveContainer
                        width="100%"
                        height={Math.max(280, report.cierresPorTecnico.length * 36)}
                      >
                        <BarChart
                          layout="vertical"
                          data={report.cierresPorTecnico}
                          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                          <YAxis
                            type="category"
                            dataKey="tecnico_nombre"
                            width={120}
                            tick={{ fontSize: 11 }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                            }}
                          />
                          <Bar dataKey="cantidad" radius={[0, 8, 8, 0]}>
                            {report.cierresPorTecnico.map((t, index) => (
                              <Cell
                                key={t.tecnico_id}
                                fill={CHART_PALETTE[index % CHART_PALETTE.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
