import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../hooks/useAuth';
import { useTicketsPeriodReport } from '../hooks/useReports';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import type { TicketsPeriodReport } from '../types';
import { TicketLifecycleSummaryCards } from '../components/tickets/TicketLifecycleSummaryCards';
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
  rows.push(['Resumen', 'Tickets resueltos', String(report.tickets_resueltos)]);
  rows.push(['Resumen', 'Tickets cerrados', String(report.tickets_cerrados)]);
  rows.push([
    'Resumen',
    'Promedio horas hasta resolución',
    report.promedio_horas_hasta_resolucion === null
      ? ''
      : String(report.promedio_horas_hasta_resolucion),
  ]);
  rows.push([
    'Resumen',
    'Promedio horas hasta cierre',
    report.promedio_horas_hasta_cierre === null ? '' : String(report.promedio_horas_hasta_cierre),
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
  report.resolucionesPorTecnico.forEach((t) => {
    rows.push(['Resoluciones por técnico', t.tecnico_nombre, String(t.cantidad)]);
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

const PDF_HEADER_BLUE: [number, number, number] = [37, 99, 235];

async function downloadTicketsReportPdf(report: TicketsPeriodReport): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const marginLeft = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const headerH = 88;

  doc.setFillColor(...PDF_HEADER_BLUE);
  doc.rect(0, 0, pageWidth, headerH, 'F');

  const logoTop = 22;
  const logoDataUrl = await loadImageAsDataUrl(COMPANY_LOGO_PATH);
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', marginLeft, logoTop, 120, 40);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(COMPANY_NAME, pageWidth - 40, logoTop + 18, { align: 'right' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Reporte de tickets por periodo', pageWidth - 40, logoTop + 36, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  let startY = headerH + 24;
  autoTable(doc, {
    startY,
    head: [['Metrica', 'Valor']],
    body: [
      ['Desde', report.period.date_from],
      ['Hasta', report.period.date_to],
      ['Tickets creados', String(report.tickets_creados)],
      ['Tickets resueltos', String(report.tickets_resueltos)],
      ['Tickets cerrados', String(report.tickets_cerrados)],
      [
        'Promedio horas hasta resolucion',
        report.promedio_horas_hasta_resolucion === null
          ? 'N/A'
          : String(report.promedio_horas_hasta_resolucion),
      ],
      [
        'Promedio horas hasta cierre',
        report.promedio_horas_hasta_cierre === null ? 'N/A' : String(report.promedio_horas_hasta_cierre),
      ],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: PDF_HEADER_BLUE, textColor: 255 },
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
      title: 'Resoluciones por tecnico',
      rows: toPdfTableRows(
        report.resolucionesPorTecnico.map((t) => ({ name: t.tecnico_nombre, value: t.cantidad }))
      ),
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
      headStyles: { fillColor: PDF_HEADER_BLUE, textColor: 255 },
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

const CHART_AXIS_TICK = { fill: '#cbd5e1', fontSize: 11 };
const CHART_AXIS_TICK_Y = { fill: '#cbd5e1', fontSize: 12 };
const CHART_GRID_STROKE = 'rgba(56, 189, 248, 0.22)';
const CHART_TOOLTIP_STYLE = {
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  border: '1px solid rgba(56, 189, 248, 0.35)',
  borderRadius: '8px',
  color: '#f1f5f9',
};
const CHART_LEGEND_STYLE = { color: '#e2e8f0', fontSize: 12 };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="page-heading">Reportes</h1>
              <p className="page-subheading">
                Tickets creados, resueltos, cerrados y tiempos del período
              </p>
            </div>
            {report && (
              <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isExportingPdf ? 'Generando PDF...' : 'Exportar PDF'}
                </button>
                <button
                  type="button"
                  onClick={() => downloadTicketsReportCsv(report)}
                  className="btn-secondary text-sm"
                >
                  Exportar CSV
                </button>
              </div>
            )}
          </div>

          <div className="content-panel mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-4">Rango de fechas</h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 min-w-0">
                <label htmlFor="report-date-from" className="label-field">
                  Desde
                </label>
                <input
                  id="report-date-from"
                  type="date"
                  value={draftFrom}
                  onChange={(e) => setDraftFrom(e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label htmlFor="report-date-to" className="label-field">
                  Hasta
                </label>
                <input
                  id="report-date-to"
                  type="date"
                  value={draftTo}
                  onChange={(e) => setDraftTo(e.target.value)}
                  className="input-field w-full"
                />
              </div>
              <button
                type="button"
                onClick={applyRange}
                disabled={!draftFrom || !draftTo || draftFrom > draftTo}
                className="btn-primary w-full sm:w-auto shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Actualizar
              </button>
            </div>
            <p className="mt-3 text-xs text-blue-100/70">
              Máximo 366 días. Por defecto: últimos 30 días.
            </p>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
              <p className="mt-3 text-sm text-blue-100/85">Generando reporte...</p>
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200 backdrop-blur-sm">
              {(error as Error)?.message || 'No se pudo cargar el reporte'}
              <button
                type="button"
                className="ml-3 font-medium text-red-100 underline hover:text-white"
                onClick={() => refetch()}
              >
                Reintentar
              </button>
            </div>
          )}

          {!isLoading && !isError && report && (
            <>
              <div className="mb-6">
                <TicketLifecycleSummaryCards metrics={report} period={report.period} />
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 mb-6">
                <div className="content-panel">
                  <h2 className="mb-4 text-lg font-semibold text-white">Creados por estado</h2>
                    {report.porEstado.length === 0 || totalPorEstado === 0 ? (
                      <p className="py-16 text-center text-blue-200/50">Sin datos en este período</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={report.porEstado}
                          margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                          <XAxis
                            dataKey="estado_nombre"
                            tick={CHART_AXIS_TICK}
                            angle={-35}
                            textAnchor="end"
                            height={70}
                          />
                          <YAxis tick={CHART_AXIS_TICK_Y} allowDecimals={false} />
                          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
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

                  <div className="content-panel">
                    <h2 className="mb-4 text-lg font-semibold text-white">
                      Creados por prioridad
                    </h2>
                    {report.porPrioridad.every((p) => !p.cantidad) ? (
                      <p className="py-16 text-center text-blue-200/50">Sin datos en este período</p>
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
                            stroke="rgba(15, 23, 42, 0.5)"
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
                          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                          <Legend wrapperStyle={CHART_LEGEND_STYLE} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="content-panel mb-6">
                  <h2 className="mb-4 text-lg font-semibold text-white">
                    Creados por categoría
                  </h2>
                  {report.porCategoria.length === 0 || totalPorCategoria === 0 ? (
                    <p className="py-16 text-center text-blue-200/50">Sin datos en este período</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart
                        data={report.porCategoria}
                        margin={{ top: 8, right: 8, left: 0, bottom: 56 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                        <XAxis
                          dataKey="nombre"
                          tick={CHART_AXIS_TICK}
                          angle={-35}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis tick={CHART_AXIS_TICK_Y} allowDecimals={false} />
                        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                        <Bar dataKey="cantidad" radius={[8, 8, 0, 0]}>
                          {report.porCategoria.map((c, index) => (
                            <Cell key={c.id} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="content-panel mb-6">
                  <h2 className="mb-4 text-lg font-semibold text-white">
                    Creados por área de incidente
                  </h2>
                  {report.porArea.every((a) => !a.cantidad) ? (
                    <p className="py-16 text-center text-blue-200/50">Sin datos en este período</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={report.porArea}
                        margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                        <XAxis
                          dataKey="nombre"
                          tick={CHART_AXIS_TICK}
                          angle={-35}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis tick={CHART_AXIS_TICK_Y} allowDecimals={false} />
                        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
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

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <div className="content-panel">
                    <h2 className="mb-4 text-lg font-semibold text-white">
                      Resoluciones por técnico
                    </h2>
                    {report.resolucionesPorTecnico.length === 0 ? (
                      <p className="py-16 text-center text-blue-200/50">
                        Sin resoluciones en este período
                      </p>
                    ) : (
                      <ResponsiveContainer
                        width="100%"
                        height={Math.max(280, report.resolucionesPorTecnico.length * 36)}
                      >
                        <BarChart
                          layout="vertical"
                          data={report.resolucionesPorTecnico}
                          margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                          <XAxis type="number" tick={CHART_AXIS_TICK_Y} allowDecimals={false} />
                          <YAxis
                            type="category"
                            dataKey="tecnico_nombre"
                            width={120}
                            tick={CHART_AXIS_TICK}
                          />
                          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                          <Bar dataKey="cantidad" radius={[0, 8, 8, 0]}>
                            {report.resolucionesPorTecnico.map((t, index) => (
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

                  <div className="content-panel">
                    <h2 className="mb-4 text-lg font-semibold text-white">
                      Cierres por técnico
                    </h2>
                    {report.cierresPorTecnico.length === 0 ? (
                      <p className="py-16 text-center text-blue-200/50">Sin cierres en este período</p>
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
                          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
                          <XAxis type="number" tick={CHART_AXIS_TICK_Y} allowDecimals={false} />
                          <YAxis
                            type="category"
                            dataKey="tecnico_nombre"
                            width={120}
                            tick={CHART_AXIS_TICK}
                          />
                          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
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
      </PageWrapper>
    </>
  );
};
