import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, FileDown, X } from 'lucide-react';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import formStyles from '../styles/modules/forms.module.css';
import {
  useAddEquipmentLoanComment,
  useApproveLoan,
  useDeliverLoan,
  useLoanById,
  useRejectLoan,
  useReturnLoan,
  useRevokeLoanApproval,
  useUpdatePendingLoanChecklist,
} from '../hooks/useLoans';
import { useAuth } from '../hooks/useAuth';
import { translateRole } from '../utils/roleTranslations';

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
  const navigate = useNavigate();
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
  const revokeApproval = useRevokeLoanApproval();
  const addLoanComment = useAddEquipmentLoanComment();
  const [physicalCondition, setPhysicalCondition] = useState<'new' | 'good' | 'worn' | 'damaged'>(
    'good'
  );
  const [batteryLevel, setBatteryLevel] = useState<number | ''>('');
  const [observations, setObservations] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [revokeNotes, setRevokeNotes] = useState('');
  const [loanCommentText, setLoanCommentText] = useState('');

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

  const formatDateTime = (value?: string | null) =>
    value
      ? new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
      : '-';

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

  const renderStatusBadge = (status: string) => (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        statusBadgeStyles[status] || 'bg-slate-100 text-slate-800'
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6 space-y-6">
            <button
              type="button"
              onClick={() => navigate('/loans')}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-200/90 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a préstamos
            </button>

            <header>
              <h1 className="page-heading">Entrega y Devolución</h1>
              <p className="page-subheading mt-2">Registro operativo con checklist y acta.</p>
            </header>

          {isLoading ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="text-center">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
                <p className="mt-3 text-sm text-blue-100/80">Cargando préstamo…</p>
              </div>
            </div>
          ) : isError || !loan ? (
            <div className="card text-center py-12">
              <p className="text-rose-200/95 font-medium">No se pudo cargar el préstamo</p>
              <p className="mt-2 text-sm text-blue-100/75">{loanLoadErrorMessage}</p>
              <button type="button" onClick={() => refetch()} className="btn-primary mt-4">
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-white sm:text-2xl">Préstamo</h2>
                  <p className="mt-1 font-mono text-sm text-blue-100/85 break-all">{displayRequestCode}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-blue-100/85">
                    <span>
                      <span className="text-blue-50/90">Solicitante:</span> {loan.requester_name}
                    </span>
                    <span className="hidden sm:inline text-blue-300/40" aria-hidden>
                      ·
                    </span>
                    <span className="inline-flex flex-wrap items-center gap-2">
                      <span className="text-blue-50/90">Estado:</span>
                      {renderStatusBadge(loan.status)}
                    </span>
                  </div>
                </div>
              </header>

              <div className="card space-y-5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Datos del préstamo
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="info-tile">
                    <p className="text-xs font-medium uppercase tracking-wide text-blue-100/60 mb-1">
                      Área destino
                    </p>
                    <p className="text-sm font-medium text-blue-50 break-words">
                      {loan.target_incident_area_name || 'No especificada'}
                    </p>
                  </div>
                  <div className="info-tile">
                    <p className="text-xs font-medium uppercase tracking-wide text-blue-100/60 mb-1">
                      Fecha de inicio
                    </p>
                    <p className="text-sm font-medium text-blue-50">{formatDate(loan.start_date)}</p>
                  </div>
                  <div className="info-tile sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-blue-100/60 mb-1">
                      Devolución esperada
                    </p>
                    <p className="text-sm font-medium text-blue-50">
                      {formatDate(loan.expected_return_date)}
                    </p>
                  </div>
                </div>

                <div className="content-panel content-panel--sky !mb-0 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-100/60">
                    Motivo de la solicitud
                  </p>
                  <p className="text-sm text-blue-100/90 leading-relaxed break-words">
                    {loan.request_notes?.trim() || 'El solicitante no registró un motivo adicional.'}
                  </p>
                </div>
              </div>

              {loan.status === 'rejected' && (
                <div className="content-panel !mb-0 border-l-4 border-l-rose-400/90 bg-rose-950/30 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-rose-200/90">
                    Motivo del rechazo
                  </p>
                  <p className="text-sm text-rose-100/95 leading-relaxed break-words">
                    {loan.rejection_reason?.trim() || 'No se registró un motivo de rechazo.'}
                  </p>
                </div>
              )}

              <div className="card space-y-5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Checklist técnico
                  {!isChecklistEditable && (
                    <span className="text-xs font-normal text-blue-100/55">(solo lectura)</span>
                  )}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className={formStyles.formGroup}>
                    <label htmlFor="loan-physical-condition" className="label-field">
                      Estado físico
                    </label>
                    <select
                      id="loan-physical-condition"
                      value={physicalCondition}
                      onChange={(e) =>
                        setPhysicalCondition(e.target.value as 'new' | 'good' | 'worn' | 'damaged')
                      }
                      disabled={!isChecklistEditable}
                      className={`input-dark ${formStyles.selectField} disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      <option value="new">Nuevo</option>
                      <option value="good">Bueno</option>
                      <option value="worn">Desgastado</option>
                      <option value="damaged">Dañado</option>
                    </select>
                  </div>
                  <div className={formStyles.formGroup}>
                    <label htmlFor="loan-battery-level" className="label-field">
                      Batería (%)
                    </label>
                    <input
                      id="loan-battery-level"
                      type="number"
                      min={0}
                      max={100}
                      value={batteryLevel}
                      onChange={(e) =>
                        setBatteryLevel(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      disabled={!isChecklistEditable}
                      className="input-dark disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="Ej: 85"
                    />
                  </div>
                  <div className={formStyles.formGroup}>
                    <label htmlFor="loan-observations" className="label-field">
                      Observaciones
                    </label>
                    <input
                      id="loan-observations"
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      disabled={!isChecklistEditable}
                      className="input-dark disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="Anotaciones relevantes"
                    />
                  </div>
                </div>
              </div>

              <div className="card space-y-5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  Equipos del préstamo
                  <span className="text-sm font-normal text-blue-100/60 tabular-nums">
                    ({loan.items.length})
                  </span>
                </h2>

                <ul className="divide-y divide-sky-400/20 rounded-xl border border-sky-400/25 overflow-hidden">
                  {loan.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex gap-3 px-3 py-3 sm:px-4 sm:py-3.5 bg-slate-900/30"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {item.equipment_name || item.pool_name}
                        </p>
                        <p className="mt-0.5 text-xs text-blue-100/65">Equipo incluido en este préstamo</p>
                      </div>
                      <span className="shrink-0 self-center rounded-lg bg-sky-500/20 px-2.5 py-1 text-xs font-semibold text-sky-100 ring-1 ring-sky-400/30 tabular-nums">
                        × {item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2 pt-1 border-t border-sky-400/20">
                  {loan.status === 'pending' && (
                    <button
                      type="button"
                      onClick={printSolicitud}
                      className="btn-secondary inline-flex items-center gap-2"
                    >
                      <FileDown className="h-4 w-4 shrink-0" aria-hidden />
                      Imprimir solicitud
                    </button>
                  )}
                  {loan.status === 'approved' && canReviewLoans && (
                    <button
                      type="button"
                      onClick={() => printActa('ENTREGA')}
                      className="btn-secondary inline-flex items-center gap-2"
                    >
                      <FileDown className="h-4 w-4 shrink-0" aria-hidden />
                      Acta de entrega
                    </button>
                  )}
                  {loan.status === 'delivered' && (
                    <button
                      type="button"
                      onClick={() => printActa('DEVOLUCION')}
                      className="btn-secondary inline-flex items-center gap-2"
                    >
                      <FileDown className="h-4 w-4 shrink-0" aria-hidden />
                      Acta de devolución
                    </button>
                  )}
                  {loan.status === 'pending' && canReviewLoans && (
                    <>
                      <button
                        type="button"
                        onClick={() => approveLoan.mutate({ id: loan.id })}
                        disabled={approveLoan.isPending}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
                      >
                        <Check className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
                        {approveLoan.isPending ? 'Aprobando…' : 'Aprobar préstamo'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRejectModalOpen(true)}
                        disabled={rejectLoan.isPending}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 shadow-lg hover:from-rose-600 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
                      >
                        <X className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
                        {rejectLoan.isPending ? 'Rechazando…' : 'Rechazar préstamo'}
                      </button>
                    </>
                  )}
                  {loan.status === 'approved' && canReviewLoans && (
                    <>
                      <button
                        type="button"
                        onClick={() => deliverLoan.mutate({ id: loan.id, payload: checklistPayload })}
                        disabled={deliverLoan.isPending}
                        className="btn-primary inline-flex items-center gap-2 disabled:opacity-60"
                      >
                        {deliverLoan.isPending ? 'Registrando entrega…' : 'Registrar entrega'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRevokeModalOpen(true)}
                        disabled={revokeApproval.isPending}
                        className="btn-secondary"
                      >
                        Anular aprobación
                      </button>
                    </>
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
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
                    >
                      {returnLoan.isPending ? 'Registrando devolución…' : 'Registrar devolución'}
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
                      className="btn-secondary disabled:opacity-60"
                    >
                      {updatePendingChecklist.isPending
                        ? 'Actualizando…'
                        : 'Actualizar checklist'}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="card space-y-5">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Historial
                  </h2>
                  {(loan.history || []).length === 0 ? (
                    <div className="text-center py-8 content-panel !mb-0">
                      <p className="text-blue-100/80">Sin movimientos registrados.</p>
                    </div>
                  ) : (
                    <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {(loan.history || []).map((entry) => (
                        <li
                          key={entry.id}
                          className="content-panel content-panel--sky !mb-0 !p-4 border-l-4 border-l-sky-400/80"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <p className="text-sm font-semibold text-blue-50 truncate">
                              {entry.changed_by_user_name}
                            </p>
                            {renderStatusBadge(entry.new_status)}
                          </div>
                          {entry.previous_status && (
                            <p className="text-xs text-blue-100/65 mb-1">
                              Desde: {statusLabels[entry.previous_status] || entry.previous_status}
                            </p>
                          )}
                          <time className="text-xs text-blue-100/70">{formatDateTime(entry.created_at)}</time>
                          {entry.notes?.trim() ? (
                            <p className="mt-2 text-sm text-blue-100/85 leading-relaxed rounded-lg bg-slate-900/40 px-3 py-2 ring-1 ring-white/5 whitespace-pre-wrap break-words">
                              {entry.notes}
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="card space-y-5">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <svg className="w-6 h-6 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Comentarios ({(loan.comments || []).length})
                  </h2>
                  <p className="text-xs text-blue-100/65 -mt-2">
                    Comunícate con {canReviewLoans ? 'el solicitante' : 'administración'} aquí.
                  </p>
                  {(loan.comments || []).length === 0 ? (
                    <div className="text-center py-8 content-panel !mb-0">
                      <p className="text-blue-100/80">Aún no hay comentarios.</p>
                    </div>
                  ) : (
                    <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {(loan.comments || []).map((comment) => (
                        <li
                          key={comment.id}
                          className="content-panel content-panel--violet !mb-0 !p-4 border-l-4 border-l-violet-400/80"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 shrink-0 rounded-full bg-violet-500/25 ring-1 ring-violet-400/40 flex items-center justify-center text-violet-200 font-semibold text-sm">
                                {(comment.created_by_user_name || '?').charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-blue-50 truncate">
                                  {comment.created_by_user_name}
                                </p>
                                <time className="text-xs text-blue-100/70">
                                  {formatDateTime(comment.created_at)}
                                </time>
                              </div>
                            </div>
                            {comment.created_by_user_role && (
                              <span className="text-xs shrink-0 self-start px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-100 ring-1 ring-violet-400/30 font-medium">
                                {translateRole(comment.created_by_user_role)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-blue-100/90 leading-relaxed whitespace-pre-wrap break-words">
                            {comment.comment_text}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                  <form
                    className="border-t border-sky-400/20 pt-5 space-y-3"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!loanCommentText.trim()) return;
                      await addLoanComment.mutateAsync({
                        id: loan.id,
                        commentText: loanCommentText.trim(),
                      });
                      setLoanCommentText('');
                      refetch();
                    }}
                  >
                    <label htmlFor="loan-comment" className="label-field">
                      Nuevo comentario
                    </label>
                    <textarea
                      id="loan-comment"
                      value={loanCommentText}
                      onChange={(e) => setLoanCommentText(e.target.value)}
                      rows={3}
                      className="input-dark resize-y min-h-[5.5rem]"
                      placeholder="Escribe un mensaje para la otra parte..."
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={addLoanComment.isPending || !loanCommentText.trim()}
                        className="btn-primary inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {addLoanComment.isPending ? (
                          <span className={formStyles.loadingSpinner} aria-hidden />
                        ) : null}
                        {addLoanComment.isPending ? 'Enviando…' : 'Enviar comentario'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
          </div>
        </div>

        {isRejectModalOpen && loan && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <div className="card w-full max-w-md space-y-4" role="dialog" aria-modal="true" aria-labelledby="reject-loan-title">
              <h3 id="reject-loan-title" className="text-lg font-semibold text-white">
                Rechazar préstamo
              </h3>
              <p className="text-sm text-blue-100/80">
                Ingresa el motivo por el cual se rechaza la solicitud {displayRequestCode}.
              </p>
              <div className={formStyles.formGroup}>
                <label htmlFor="reject-reason" className="label-field">
                  Motivo del rechazo
                </label>
                <textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="input-dark resize-y min-h-[5rem]"
                  placeholder="Ej: El equipo se encuentra reservado para una operación crítica."
                />
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRejectModalOpen(false);
                    setRejectReason('');
                  }}
                  className="btn-secondary w-full sm:w-auto"
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:opacity-60 w-full sm:w-auto"
                >
                  {rejectLoan.isPending ? 'Rechazando…' : 'Confirmar rechazo'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isRevokeModalOpen && loan && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <div className="card w-full max-w-md space-y-4" role="dialog" aria-modal="true" aria-labelledby="revoke-loan-title">
              <h3 id="revoke-loan-title" className="text-lg font-semibold text-white">
                Anular aprobación
              </h3>
              <p className="text-sm text-blue-100/80">
                El préstamo {displayRequestCode} volverá a estado pendiente. Podrás aprobarlo de nuevo cuando
                corresponda.
              </p>
              <div className={formStyles.formGroup}>
                <label htmlFor="revoke-notes" className="label-field">
                  Nota interna <span className="font-normal text-blue-100/50">(opcional)</span>
                </label>
                <textarea
                  id="revoke-notes"
                  value={revokeNotes}
                  onChange={(e) => setRevokeNotes(e.target.value)}
                  rows={3}
                  className="input-dark resize-y min-h-[5rem]"
                  placeholder="Ej: Se revierte para cambiar el equipo asignado."
                />
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRevokeModalOpen(false);
                    setRevokeNotes('');
                  }}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  disabled={revokeApproval.isPending}
                  onClick={() => {
                    revokeApproval.mutate(
                      {
                        id: loanId,
                        notes: revokeNotes.trim() || undefined,
                      },
                      {
                        onSuccess: async () => {
                          setIsRevokeModalOpen(false);
                          setRevokeNotes('');
                          await refetch();
                        },
                      }
                    );
                  }}
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-60 w-full sm:w-auto"
                >
                  {revokeApproval.isPending ? 'Anulando…' : 'Confirmar anulación'}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageWrapper>
    </>
  );
};
