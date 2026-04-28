import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import {
  useApproveLoan,
  useDeliverLoan,
  useLoanById,
  useRejectLoan,
  useUpdatePendingLoanChecklist,
  useReturnLoan,
} from '../hooks/useLoans';
import { useAuth } from '../hooks/useAuth';

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  delivered: 'Entregado',
  overdue: 'Vencido',
  returned: 'Devuelto',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
};

const statusBadgeStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900',
  approved: 'bg-emerald-100 text-emerald-900',
  delivered: 'bg-emerald-100 text-emerald-900',
  overdue: 'bg-red-100 text-red-900',
  returned: 'bg-slate-100 text-slate-800',
  rejected: 'bg-rose-100 text-rose-900',
  cancelled: 'bg-slate-100 text-slate-800',
};

const conditionLabels: Record<'new' | 'good' | 'worn' | 'damaged', string> = {
  new: 'Nuevo',
  good: 'Bueno',
  worn: 'Desgastado',
  damaged: 'Dañado',
};

export const LoanHandoverReturn: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const loanId = useMemo(() => Number(id), [id]);
  const {
    data: loan,
    isLoading,
    isError,
    error,
    refetch,
  } = useLoanById(Number.isFinite(loanId) ? loanId : undefined);
  const approveLoan = useApproveLoan();
  const rejectLoan = useRejectLoan();
  const updatePendingChecklist = useUpdatePendingLoanChecklist();
  const deliverLoan = useDeliverLoan();
  const returnLoan = useReturnLoan();
  const [physicalCondition, setPhysicalCondition] = useState<'new' | 'good' | 'worn' | 'damaged'>(
    'good'
  );
  const [batteryLevel, setBatteryLevel] = useState<number | ''>('');
  const [observations, setObservations] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const checklistPayload = {
    physical_condition: physicalCondition,
    battery_level: batteryLevel === '' ? undefined : Number(batteryLevel),
    observations: observations || undefined,
  };

  React.useEffect(() => {
    if (!loan) return;
    if (loan.pending_physical_condition) {
      setPhysicalCondition(loan.pending_physical_condition);
    }
    if (loan.pending_battery_level !== null && loan.pending_battery_level !== undefined) {
      setBatteryLevel(Number(loan.pending_battery_level));
    } else {
      setBatteryLevel('');
    }
    setObservations(loan.pending_observations || '');
  }, [loan]);
  const canReviewLoans = user?.role === 'administrator';
  const displayRequestCode = loan?.request_code || (loan ? `#${loan.id}` : '');
  const loanLoadErrorMessage =
    (error as { response?: { data?: { message?: string } } } | null)?.response?.data?.message ||
    'Ocurrió un error al consultar la solicitud.';
  const isChecklistEditable = loan?.status === 'pending';

  const formatDate = (date?: string | null) => {
    if (!date) return 'N/A';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return 'N/A';
    return parsedDate.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const printActa = (actaType: 'ENTREGA' | 'DEVOLUCION') => {
    if (!loan) return;

    const issueDate = new Date().toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const itemsRows = loan.items
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(item.equipment_name || item.pool_name || 'Item sin nombre')}</td>
            <td>${item.quantity}</td>
          </tr>
        `
      )
      .join('');

    const observationsText = observations.trim()
      ? escapeHtml(observations.trim())
      : 'Sin observaciones adicionales.';

    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Acta de ${actaType} - Préstamo #${loan.id}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; margin: 0; padding: 32px; }
            .sheet { max-width: 900px; margin: 0 auto; }
            h1 { font-size: 22px; margin: 0 0 6px; text-align: center; }
            h2 { font-size: 15px; margin: 0 0 18px; text-align: center; color: #334155; font-weight: 500; }
            p { margin: 0 0 12px; line-height: 1.5; font-size: 13px; }
            .meta { margin: 14px 0 20px; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; }
            .meta-row { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 6px; font-size: 13px; }
            .meta-row:last-child { margin-bottom: 0; }
            .section-title { font-size: 14px; font-weight: 700; margin: 20px 0 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; }
            th { background: #eff6ff; text-align: left; }
            .checklist { margin-top: 8px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; background: #f8fafc; }
            .signatures { margin-top: 46px; display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
            .signature-line { border-top: 1px solid #334155; padding-top: 8px; text-align: center; font-size: 12px; }
            @media print {
              body { padding: 8mm; }
              .sheet { max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <h1>ACTA DE ${actaType} DE EQUIPOS TECNOLÓGICOS</h1>
            <h2>Sistema de Gestión de Soporte - Alcaldía Angostura del Orinoco</h2>

            <p>En fecha <strong>${issueDate}</strong>, se deja constancia del proceso de <strong>${actaType.toLowerCase()}</strong> correspondiente al préstamo <strong>#${loan.id}</strong>, solicitado por <strong>${escapeHtml(loan.requester_name)}</strong>, en cumplimiento del control administrativo y operativo de activos tecnológicos.</p>

            <div class="meta">
              <div class="meta-row"><span><strong>Préstamo:</strong> ${escapeHtml(loan.request_code || `#${loan.id}`)}</span><span><strong>Estado:</strong> ${escapeHtml(statusLabels[loan.status] || loan.status)}</span></div>
              <div class="meta-row"><span><strong>Solicitante:</strong> ${escapeHtml(loan.requester_name)}</span><span><strong>Fecha de inicio:</strong> ${formatDate(loan.start_date)}</span></div>
              <div class="meta-row"><span><strong>Área destino:</strong> ${escapeHtml(loan.target_incident_area_name || 'No especificada')}</span><span><strong>Retorno esperado:</strong> ${formatDate(loan.expected_return_date)}</span></div>
              <div class="meta-row"><span><strong>Fecha del acta:</strong> ${issueDate}</span><span></span></div>
            </div>

            <div class="section-title">Equipos relacionados</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">Nro</th>
                  <th>Descripción del equipo</th>
                  <th style="width: 120px;">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div class="section-title">Checklist técnico</div>
            <div class="checklist">
              <p><strong>Estado físico:</strong> ${conditionLabels[physicalCondition]}</p>
              <p><strong>Nivel de batería:</strong> ${batteryLevel === '' ? 'No especificado' : `${batteryLevel}%`}</p>
              <p><strong>Observaciones:</strong> ${observationsText}</p>
            </div>

            <p style="margin-top: 16px;">Las partes dejan constancia de que la información descrita en esta acta refleja el estado y condiciones verificadas al momento del registro. Este documento se emite para fines de control interno y trazabilidad del préstamo.</p>

            <div class="signatures">
              <div class="signature-line">
                ${escapeHtml(loan.requester_name)}<br/>
                Solicitante
              </div>
              <div class="signature-line">
                Responsable de soporte<br/>
                Área de tecnología
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('about:blank', '_blank', 'width=1024,height=768');
    if (!printWindow) return;
    printWindow.focus();
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const printSolicitud = () => {
    if (!loan) return;

    const issueDate = new Date().toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const itemsRows = loan.items
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(item.equipment_name || item.pool_name || 'Item sin nombre')}</td>
            <td>${item.quantity}</td>
          </tr>
        `
      )
      .join('');

    const requestNotes = loan.request_notes?.trim()
      ? escapeHtml(loan.request_notes.trim())
      : 'Sin justificacion adicional.';

    const html = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Solicitud de Préstamo #${loan.id}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #0f172a; margin: 0; padding: 32px; }
            .sheet { max-width: 900px; margin: 0 auto; }
            h1 { font-size: 22px; margin: 0 0 6px; text-align: center; }
            h2 { font-size: 15px; margin: 0 0 18px; text-align: center; color: #334155; font-weight: 500; }
            p { margin: 0 0 12px; line-height: 1.5; font-size: 13px; }
            .meta { margin: 14px 0 20px; padding: 12px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; }
            .meta-row { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 6px; font-size: 13px; }
            .meta-row:last-child { margin-bottom: 0; }
            .section-title { font-size: 14px; font-weight: 700; margin: 20px 0 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; }
            th { background: #eff6ff; text-align: left; }
            .justification { margin-top: 8px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; background: #f8fafc; font-size: 13px; line-height: 1.5; }
            .signatures { margin-top: 46px; display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
            .signature-line { border-top: 1px solid #334155; padding-top: 8px; text-align: center; font-size: 12px; }
            @media print {
              body { padding: 8mm; }
              .sheet { max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <h1>SOLICITUD DE PRÉSTAMO DE EQUIPOS TECNOLÓGICOS</h1>
            <h2>Sistema de Gestión de Soporte - Alcaldía Angostura del Orinoco</h2>

            <p>Por medio del presente documento se formaliza la solicitud de préstamo de equipos tecnológicos identificada con el número <strong>#${loan.id}</strong>, presentada por <strong>${escapeHtml(loan.requester_name)}</strong>, para su evaluación y aprobación administrativa.</p>

            <div class="meta">
              <div class="meta-row"><span><strong>Solicitud:</strong> ${escapeHtml(loan.request_code || `#${loan.id}`)}</span><span><strong>Estado:</strong> ${escapeHtml(statusLabels[loan.status] || loan.status)}</span></div>
              <div class="meta-row"><span><strong>Solicitante:</strong> ${escapeHtml(loan.requester_name)}</span><span><strong>Fecha de solicitud:</strong> ${formatDate(loan.created_at)}</span></div>
              <div class="meta-row"><span><strong>Área destino:</strong> ${escapeHtml(loan.target_incident_area_name || 'No especificada')}</span><span><strong>Correo:</strong> ${escapeHtml(loan.requester_email || 'No registrado')}</span></div>
              <div class="meta-row"><span><strong>Fecha de inicio requerida:</strong> ${formatDate(loan.start_date)}</span><span><strong>Fecha estimada de devolución:</strong> ${formatDate(loan.expected_return_date)}</span></div>
              <div class="meta-row"><span><strong>Fecha de emisión:</strong> ${issueDate}</span><span></span></div>
            </div>

            <div class="section-title">Detalle de equipos solicitados</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 50px;">Nro</th>
                  <th>Descripción del equipo</th>
                  <th style="width: 120px;">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div class="section-title">Justificación de la solicitud</div>
            <div class="justification">${requestNotes}</div>

            <p style="margin-top: 16px;">Se deja constancia de que esta solicitud será revisada por el área de soporte para determinar disponibilidad y condiciones de entrega, conforme a los procedimientos internos de control de activos.</p>

            <div class="signatures">
              <div class="signature-line">
                ${escapeHtml(loan.requester_name)}<br/>
                Solicitante
              </div>
              <div class="signature-line">
                Recibido por<br/>
                Área de soporte / Administración
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('about:blank', '_blank', 'width=1024,height=768');
    if (!printWindow) return;
    printWindow.focus();
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Entrega y Devolución
            </h1>
            <p className="mt-1 text-sm text-gray-600">Registro operativo con checklist y acta.</p>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-gray-600 shadow-sm">
              Cargando préstamo...
            </div>
          ) : isError || !loan ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center shadow-sm">
              <p className="text-sm font-semibold text-rose-800">No se pudo cargar el préstamo.</p>
              <p className="mt-1 text-xs text-rose-700">{loanLoadErrorMessage}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-lg border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Préstamo
                    </p>
                    <p className="text-xl font-semibold text-slate-900">{displayRequestCode}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      statusBadgeStyles[loan.status] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {statusLabels[loan.status] || loan.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Solicitante
                    </p>
                    <p className="text-sm font-medium text-slate-800">{loan.requester_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Estado técnico
                    </p>
                    <span
                      className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        statusBadgeStyles[loan.status] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {statusLabels[loan.status] || loan.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Área destino
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {loan.target_incident_area_name || 'No especificada'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-2 text-base font-semibold text-slate-900">
                  Motivo de la solicitud
                </h2>
                <p className="text-sm leading-relaxed text-slate-700">
                  {loan.request_notes?.trim() || 'El solicitante no registró un motivo adicional.'}
                </p>
              </div>

              {loan.status === 'rejected' && (
                <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
                  <h2 className="mb-2 text-base font-semibold text-rose-900">Motivo del rechazo</h2>
                  <p className="text-sm leading-relaxed text-rose-800">
                    {loan.rejection_reason?.trim() || 'No se registró un motivo de rechazo.'}
                  </p>
                </div>
              )}

              <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-slate-900">Checklist</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Estado físico
                    </span>
                    <select
                      value={physicalCondition}
                      onChange={(e) =>
                        setPhysicalCondition(e.target.value as 'new' | 'good' | 'worn' | 'damaged')
                      }
                      disabled={!isChecklistEditable}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                    >
                      <option value="new">Nuevo</option>
                      <option value="good">Bueno</option>
                      <option value="worn">Desgastado</option>
                      <option value="damaged">Dañado</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Batería (%)
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={batteryLevel}
                      onChange={(e) =>
                        setBatteryLevel(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      disabled={!isChecklistEditable}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                      placeholder="Ej: 85"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Observaciones
                    </span>
                    <input
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      disabled={!isChecklistEditable}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                      placeholder="Anotaciones relevantes"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-2 text-base font-semibold text-slate-900">Items del préstamo</h2>
                <ul className="mb-5 space-y-3 text-sm text-slate-700">
                  {loan.items.map((item) => (
                    <li
                      key={item.id}
                      className="relative overflow-hidden rounded-xl border border-blue-300 bg-white p-5 shadow-md"
                    >
                      <div className="pointer-events-none absolute -right-8 -top-8 h-16 w-16 rounded-full bg-blue-50 opacity-100" />
                      <div className="relative z-10 flex w-full items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-blue-600">
                            {item.equipment_name || item.pool_name}
                          </p>
                          <p className="text-xs text-gray-500">Equipo incluido en este préstamo</p>
                        </div>
                        <span className="inline-flex shrink-0 items-center rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                          Cantidad: {item.quantity}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-3">
                  {loan.status === 'pending' && (
                    <button
                      type="button"
                      onClick={printSolicitud}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Imprimir solicitud (PDF)
                    </button>
                  )}
                  {loan.status === 'approved' && (
                    <button
                      type="button"
                      onClick={() => printActa('ENTREGA')}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Imprimir acta de entrega (PDF)
                    </button>
                  )}
                  {loan.status === 'delivered' && (
                    <button
                      type="button"
                      onClick={() => printActa('DEVOLUCION')}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Imprimir acta de devolución (PDF)
                    </button>
                  )}
                  {loan.status === 'pending' && canReviewLoans && (
                    <>
                      <button
                        type="button"
                        onClick={() => approveLoan.mutate({ id: loan.id })}
                        disabled={approveLoan.isPending}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                      >
                        {approveLoan.isPending ? 'Aprobando...' : 'Aprobar préstamo'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRejectModalOpen(true)}
                        disabled={rejectLoan.isPending}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                      >
                        {rejectLoan.isPending ? 'Rechazando...' : 'Rechazar préstamo'}
                      </button>
                    </>
                  )}
                  {loan.status === 'approved' && (
                    <button
                      type="button"
                      onClick={() => deliverLoan.mutate({ id: loan.id, payload: checklistPayload })}
                      disabled={deliverLoan.isPending}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                      {deliverLoan.isPending ? 'Registrando entrega...' : 'Registrar entrega'}
                    </button>
                  )}
                  {(loan.status === 'delivered' || loan.status === 'overdue') && (
                    <button
                      type="button"
                      onClick={() =>
                        returnLoan.mutate({
                          id: loan.id,
                          payload: {
                            ...checklistPayload,
                            incidents: [],
                          },
                        })
                      }
                      disabled={returnLoan.isPending}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                    >
                      {returnLoan.isPending ? 'Registrando devolución...' : 'Registrar devolución'}
                    </button>
                  )}
                  {loan.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() =>
                        updatePendingChecklist.mutate({
                          id: loan.id,
                          payload: checklistPayload,
                        })
                      }
                      disabled={updatePendingChecklist.isPending}
                      className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {updatePendingChecklist.isPending
                        ? 'Actualizando...'
                        : 'Actualizar checklist'}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {isRejectModalOpen && loan && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900">Rechazar préstamo</h3>
              <p className="mt-1 text-sm text-slate-600">
                Ingresa el motivo por el cual se rechaza la solicitud {displayRequestCode}.
              </p>
              <label className="mt-4 block text-sm font-medium text-slate-700">
                Motivo del rechazo
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
                  placeholder="Ej: El equipo se encuentra reservado para una operación crítica."
                />
              </label>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setRejectReason('');
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={rejectLoan.isPending}
                  onClick={() => {
                    rejectLoan.mutate(
                      {
                        id: loan.id,
                        reason: rejectReason.trim() || 'Rechazado por revisión administrativa',
                      },
                      {
                        onSuccess: () => {
                          setIsRejectModalOpen(false);
                          setRejectReason('');
                        },
                      }
                    );
                  }}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                >
                  {rejectLoan.isPending ? 'Rechazando...' : 'Confirmar rechazo'}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageWrapper>
    </>
  );
};
