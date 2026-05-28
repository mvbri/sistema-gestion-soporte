import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Check, FileDown, X } from 'lucide-react';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useAuth } from '../hooks/useAuth';
import {
  useAddMaterialRequestComment,
  useApproveMaterialRequest,
  useCancelMaterialRequest,
  useMaterialRequestById,
  useRejectMaterialRequest,
} from '../hooks/useMaterialRequests';
import { materialRequestService } from '../services/materialRequestService';
import { ConfirmCancelMaterialRequestModal } from '../components/materialRequests/ConfirmCancelMaterialRequestModal';
import { MaterialRequestStatusBadge } from '../components/materialRequests/MaterialRequestStatusBadge';
import { translateRole } from '../utils/roleTranslations';
import { materialRequestItemTypeLabel } from '../utils/materialRequestDisplay';
import formStyles from '../styles/modules/forms.module.css';

/** Misma ruta que en reportes PDF (`ReportsPage`). */
const INSTITUTION_LOGO_PATH = '/alcado.png';

const PDF_COUNTRY = 'REPÚBLICA BOLIVARIANA DE VENEZUELA';
const PDF_STATE_ENTITY = 'ESTADO BOLÍVAR — ALCALDÍA ANGOSTURA DEL ORINOCO';
const PDF_SYSTEM = 'Sistema de Gestión de Soporte Técnico';
const PDF_DOC_TITLE = 'FORMATO ÚNICO DE SOLICITUD DE MATERIALES';
const PDF_DOC_SUBTITLE =
  'Documento oficial para trámite administrativo, archivo y control patrimonial. Uso exclusivo del ente municipal.';
/** Azul institucional (misma familia que la barra del menú). */
const PDF_INST_BLUE: [number, number, number] = [74, 111, 165];
const PDF_INST_BLUE_DARK: [number, number, number] = [52, 78, 120];

async function loadPublicImageAsDataUrl(path: string): Promise<string | null> {
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

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

export const MaterialRequestDetail: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'administrator';
  const { id } = useParams();
  const materialRequestId = Number(id);
  const { data: materialRequest, isLoading, refetch } = useMaterialRequestById(
    Number.isFinite(materialRequestId) ? materialRequestId : undefined
  );
  const approveRequest = useApproveMaterialRequest();
  const rejectRequest = useRejectMaterialRequest();
  const cancelRequest = useCancelMaterialRequest();
  const addComment = useAddMaterialRequestComment();
  const [commentText, setCommentText] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const canCancel =
    materialRequest &&
    ((materialRequest.requester_user_id === user?.id && materialRequest.status === 'pending') ||
      (isAdmin &&
        (materialRequest.status === 'pending' || materialRequest.status === 'approved')));

  const canAdminReview = isAdmin && materialRequest?.status === 'pending';

  const printableItems = useMemo(
    () =>
      (materialRequest?.items || []).map((item, index) => [
        String(index + 1),
        materialRequestItemTypeLabel(item.material_type),
        item.material_name || `ID ${item.reference_id}`,
        String(item.quantity),
      ]),
    [materialRequest]
  );

  const handleExportPdf = async () => {
    if (!materialRequest) return;
    const response = await materialRequestService.getPdfData(materialRequest.id);
    const pdfData = response.data;
    if (!pdfData) return;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = 12;
    const frameInset = 5;
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const headerH = 36;
    const textStartX = margin + 50;

    doc.setDrawColor(...PDF_INST_BLUE_DARK);
    doc.setLineWidth(0.55);
    doc.rect(frameInset, frameInset, pageW - 2 * frameInset, pageH - 2 * frameInset, 'S');
    doc.setLineWidth(0.2);
    doc.setDrawColor(...PDF_INST_BLUE);
    doc.rect(frameInset + 1.2, frameInset + 1.2, pageW - 2 * frameInset - 2.4, pageH - 2 * frameInset - 2.4, 'S');

    doc.setFillColor(...PDF_INST_BLUE);
    doc.rect(0, 0, pageW, headerH, 'F');
    doc.setFillColor(...PDF_INST_BLUE_DARK);
    doc.rect(0, headerH - 2.2, pageW, 2.2, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.35);
    doc.line(0, headerH, pageW, headerH);

    const logoDataUrl = await loadPublicImageAsDataUrl(INSTITUTION_LOGO_PATH);
    const logoW = 44;
    const logoH = 14;
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', margin + 1, 7, logoW, logoH);
    }

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(PDF_COUNTRY, textStartX, 8);
    doc.setFontSize(7.5);
    doc.text(PDF_STATE_ENTITY, textStartX, 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(PDF_SYSTEM, textStartX, 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(PDF_DOC_TITLE, textStartX, 25);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const subLines = doc.splitTextToSize(PDF_DOC_SUBTITLE, pageW - textStartX - margin - 2);
    doc.text(subLines, textStartX, 30);
    doc.setTextColor(0, 0, 0);

    const labelValueGap = 2;

    const drawSectionTitle = (title: string, yPos: number): number => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...PDF_INST_BLUE);
      doc.text(title, margin, yPos);
      doc.setDrawColor(...PDF_INST_BLUE);
      doc.setLineWidth(0.35);
      doc.line(margin, yPos + 1.8, pageW - margin, yPos + 1.8);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      return yPos + 9;
    };

    const controlStripY = headerH + 4;
    const controlStripH = 9;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, controlStripY, pageW - 2 * margin, controlStripH, 0.8, 0.8, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('Expediente / código de solicitud:', margin + 2.5, controlStripY + 4.2);
    doc.setFont('helvetica', 'normal');
    doc.text(String(pdfData.request_code || `SM-${pdfData.id}`), margin + 58, controlStripY + 4.2);
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha y hora de emisión del documento:', pageW / 2 + 2, controlStripY + 4.2);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(new Date().toISOString()), pageW / 2 + 62, controlStripY + 4.2);
    doc.setTextColor(0, 0, 0);

    let y = controlStripY + controlStripH + 6;
    y = drawSectionTitle('I. IDENTIFICACIÓN DE LA SOLICITUD', y);

    doc.setFontSize(9);

    const drawInlineLabeled = (label: string, value: string, x: number, yPos: number) => {
      const withColon = `${label}:`;
      doc.setFont('helvetica', 'bold');
      doc.text(withColon, x, yPos);
      const labelW = doc.getTextWidth(withColon);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(value, x + labelW + labelValueGap, yPos);
    };

    const drawWrappedLabeled = (label: string, value: string, x: number, yPos: number): number => {
      const withColon = `${label}:`;
      doc.setFont('helvetica', 'bold');
      doc.text(withColon, x, yPos);
      const labelW = doc.getTextWidth(withColon);
      doc.setFont('helvetica', 'normal');
      const valueX = x + labelW + labelValueGap;
      const maxW = pageW - margin - valueX;
      const lines = doc.splitTextToSize(value, maxW);
      doc.text(lines, valueX, yPos);
      return Math.max(6, lines.length * 4.6);
    };

    drawInlineLabeled('Nombre del solicitante', pdfData.requester_name || '—', margin, y);
    y += 6;

    y += drawWrappedLabeled(
      'Nombre del destinatario',
      (pdfData.addressee_name || '—').trim() || '—',
      margin,
      y
    );

    drawInlineLabeled(
      'Cargo al que se dirige la solicitud',
      (pdfData.addressee_title || '—').trim() || '—',
      margin,
      y
    );
    y += 6;

    drawInlineLabeled(
      'Funcionario que aprueba la solicitud',
      pdfData.approved_by_user_name || '—',
      margin,
      y
    );
    y += 6;

    y = drawSectionTitle('II. RELACIÓN DE BIENES O MATERIALES SOLICITADOS', y);

    autoTable(doc, {
      startY: y,
      head: [['N°', 'Tipo', 'Descripción del bien / material', 'Cant.']],
      body: printableItems,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [203, 213, 225],
        lineWidth: 0.1,
        textColor: [30, 41, 59],
      },
      headStyles: {
        fillColor: PDF_INST_BLUE,
        textColor: 255,
        fontStyle: 'bold',
        halign: 'left',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: 28 },
        3: { halign: 'center', cellWidth: 18 },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margin, right: margin },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || y + 40;
    y = finalY + 8;

    y = drawSectionTitle('III. FUNDAMENTACIÓN Y OBSERVACIONES', y);

    const motiveBody = pdfData.request_notes?.trim() || 'Sin observaciones registradas.';
    const motiveLines = doc.splitTextToSize(motiveBody, pageW - 2 * margin - 8);
    const boxPad = 4;
    const lineHeight = 4.5;
    const boxH = Math.max(18, motiveLines.length * lineHeight + boxPad * 2);
    doc.setDrawColor(...PDF_INST_BLUE);
    doc.setLineWidth(0.25);
    doc.setFillColor(252, 252, 253);
    doc.roundedRect(margin, y, pageW - 2 * margin, boxH, 1.5, 1.5, 'FD');
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(motiveLines, margin + boxPad, y + boxPad + 3.5);
    doc.setTextColor(0, 0, 0);
    y += boxH + 10;

    y = drawSectionTitle('IV. AUTORIZACIONES Y CONSTANCIA DE FIRMAS', y);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const authNote = doc.splitTextToSize(
      'Las firmas y sellos habilitantes acreditan la solicitud, la revisión administrativa y el compromiso de uso responsable de los bienes. Documento sin enmiendas; toda corrección debe reexpedirse.',
      pageW - 2 * margin
    );
    doc.text(authNote, margin, y);
    doc.setTextColor(0, 0, 0);
    y += authNote.length * 4 + 6;

    const sigGap = 4;
    const sigColW = (pageW - 2 * margin - 2 * sigGap) / 3;
    const sigBoxH = 38;
    const sigLabels = [
      'Solicitante',
      'Revisión administrativa',
      'Visto bueno (supervisión)',
    ] as const;
    let sigX = margin;
    for (let i = 0; i < 3; i += 1) {
      doc.setDrawColor(...PDF_INST_BLUE);
      doc.setLineWidth(0.25);
      doc.setFillColor(252, 252, 253);
      doc.roundedRect(sigX, y, sigColW, sigBoxH, 1, 1, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...PDF_INST_BLUE);
      doc.text(sigLabels[i], sigX + 2, y + 5);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setDrawColor(120, 120, 120);
      const lineY = y + 14;
      doc.line(sigX + 2, lineY, sigX + sigColW - 2, lineY);
      doc.text(i === 0 ? 'Firma' : 'Firma y sello', sigX + 2, lineY + 4);
      doc.text('Apellidos y nombres:', sigX + 2, lineY + 9);
      doc.text('Cédula de identidad:', sigX + 2, lineY + 14);
      doc.text('Cargo:', sigX + 2, lineY + 19);
      sigX += sigColW + sigGap;
    }
    y += sigBoxH + 4;

    const footerY = pageH - 18;
    doc.setDrawColor(...PDF_INST_BLUE);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 3, pageW - margin, footerY - 3);
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `Documento generado electrónicamente. Origen: ${PDF_SYSTEM}, ${PDF_STATE_ENTITY}. La impresión en soporte papel debe contar con firmas autógrafas y sellos oficiales para surtir efectos administrativos. Confidencial — circulación restringida al ámbito municipal.`,
      margin,
      footerY,
      { maxWidth: pageW - 2 * margin }
    );
    doc.text(
      `Referencia de exportación: ${formatDate(new Date().toISOString())}`,
      margin,
      footerY + 8
    );
    doc.text('Página 1 de 1', pageW - margin, footerY + 8, { align: 'right' });

    doc.save(`solicitud_materiales_${pdfData.id}.pdf`);
  };

  if (isLoading) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="text-center">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
                <p className="mt-3 text-sm text-blue-100/80">Cargando solicitud...</p>
              </div>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  if (!materialRequest) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
            <div className="card text-center py-12">
              <p className="text-blue-100/90">Solicitud no encontrada</p>
              <button
                type="button"
                onClick={() => navigate('/material-requests')}
                className="btn-primary mt-4"
              >
                Volver a solicitudes
              </button>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  const requestCode = materialRequest.request_code || `#${materialRequest.id}`;

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6 space-y-6">
            <button
              type="button"
              onClick={() => navigate('/material-requests')}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-200/90 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a solicitudes
            </button>

            <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="page-heading">Solicitud de materiales</h1>
                <p className="page-subheading mt-2 font-mono text-xs break-all opacity-90">
                  {requestCode}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-blue-100/85">
                  <span>
                    <span className="text-blue-50/90">Solicitante:</span>{' '}
                    {materialRequest.requester_name}
                  </span>
                  <span className="hidden sm:inline text-blue-300/40" aria-hidden>
                    ·
                  </span>
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <span className="text-blue-50/90">Estado:</span>
                    <MaterialRequestStatusBadge status={materialRequest.status} />
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {canAdminReview && (
                  <>
                    <button
                      type="button"
                      onClick={async () => {
                        await approveRequest.mutateAsync({ id: materialRequest.id });
                        refetch();
                      }}
                      disabled={approveRequest.isPending}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
                    >
                      <Check className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
                      {approveRequest.isPending ? 'Aprobando…' : 'Aprobar'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await rejectRequest.mutateAsync({
                          id: materialRequest.id,
                          reason: 'Rechazado por revisión administrativa',
                        });
                        refetch();
                      }}
                      disabled={rejectRequest.isPending}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 shadow-lg hover:from-rose-600 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
                    >
                      <X className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
                      {rejectRequest.isPending ? 'Rechazando…' : 'Rechazar'}
                    </button>
                  </>
                )}
                {canCancel && (
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    className="btn-secondary inline-flex items-center gap-2"
                    title="Cancelar solicitud"
                  >
                    <X className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
                    Cancelar
                  </button>
                )}
                {isAdmin && materialRequest.status === 'approved' && (
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <FileDown className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                    Imprimir PDF
                  </button>
                )}
              </div>
            </header>

            <div className="card space-y-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Datos de la solicitud
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="info-tile">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-100/60 mb-1">
                    Nombre del destinatario
                  </p>
                  <p className="text-sm font-medium text-blue-50 break-words">
                    {materialRequest.addressee_name?.trim() || '—'}
                  </p>
                </div>
                <div className="info-tile">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-100/60 mb-1">
                    Cargo al que se dirige
                  </p>
                  <p className="text-sm font-medium text-blue-50 break-words">
                    {materialRequest.addressee_title?.trim() || '—'}
                  </p>
                </div>
                <div className="info-tile sm:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-100/60 mb-1">
                    Funcionario que aprueba la solicitud
                  </p>
                  <p className="text-sm font-medium text-blue-50 break-words">
                    {materialRequest.approved_by_user_name?.trim() || '—'}
                  </p>
                </div>
              </div>

              <div className="content-panel content-panel--sky !mb-0 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-100/60">Motivo</p>
                <p className="text-sm text-blue-100/90 leading-relaxed break-words">
                  {materialRequest.request_notes?.trim() || 'Sin notas'}
                </p>
              </div>

              {materialRequest.addressee_addressing_text?.trim() ? (
                <div className="content-panel content-panel--violet !mb-0 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-100/60">
                    Texto al destinatario
                  </p>
                  <p className="text-sm text-blue-100/90 leading-relaxed whitespace-pre-wrap break-words">
                    {materialRequest.addressee_addressing_text.trim()}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Materiales solicitados
                <span className="text-sm font-normal text-blue-100/60 tabular-nums">
                  ({materialRequest.items.length})
                </span>
              </h2>

              {materialRequest.items.length === 0 ? (
                <div className="text-center py-8 content-panel !mb-0">
                  <p className="text-blue-100/80">No hay materiales registrados en esta solicitud.</p>
                </div>
              ) : (
                <div className="card !p-0 overflow-hidden !shadow-none !border-sky-400/20">
                  <div className="tickets-list-light overflow-x-auto bg-white/95 rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Material
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Cantidad
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {materialRequest.items.map((item) => (
                          <tr key={item.id} className="hover:bg-sky-50/90 transition-colors">
                            <td className="px-4 sm:px-6 py-3 text-sm text-gray-900">
                              {materialRequestItemTypeLabel(item.material_type)}
                            </td>
                            <td className="px-4 sm:px-6 py-3 text-sm text-gray-900 break-words max-w-md">
                              {item.material_name || `ID ${item.reference_id}`}
                            </td>
                            <td className="px-4 sm:px-6 py-3 text-sm text-gray-900 text-right tabular-nums">
                              {item.quantity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card space-y-5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Historial
                </h2>
                {materialRequest.history.length === 0 ? (
                  <div className="text-center py-8 content-panel !mb-0">
                    <p className="text-blue-100/80">Sin cambios registrados aún.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {materialRequest.history.map((entry) => (
                      <li
                        key={entry.id}
                        className="content-panel content-panel--sky !mb-0 !p-4 border-l-4 border-l-sky-400/80"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <p className="text-sm font-semibold text-blue-50 truncate">
                            {entry.changed_by_user_name}
                          </p>
                          <MaterialRequestStatusBadge status={entry.new_status} />
                        </div>
                        <time className="text-xs text-blue-100/70">{formatDate(entry.created_at)}</time>
                        {entry.notes?.trim() ? (
                          <p className="mt-2 text-sm text-blue-100/85 leading-relaxed rounded-lg bg-slate-900/40 px-3 py-2 ring-1 ring-white/5 break-words">
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
                  Comentarios ({materialRequest.comments.length})
                </h2>

                {materialRequest.comments.length === 0 ? (
                  <div className="text-center py-8 content-panel !mb-0">
                    <p className="text-blue-100/80">Aún no hay comentarios.</p>
                  </div>
                ) : (
                  <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {materialRequest.comments.map((comment) => (
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
                                {formatDate(comment.created_at)}
                              </time>
                            </div>
                          </div>
                          <span className="text-xs shrink-0 self-start px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-100 ring-1 ring-violet-400/30 font-medium">
                            {translateRole(comment.created_by_user_role)}
                          </span>
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
                    if (!commentText.trim()) return;
                    await addComment.mutateAsync({
                      id: materialRequest.id,
                      commentText: commentText.trim(),
                    });
                    setCommentText('');
                    refetch();
                  }}
                >
                  <label htmlFor="material-request-comment" className="label-field">
                    Nuevo comentario
                  </label>
                  <textarea
                    id="material-request-comment"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                    className="input-dark resize-y min-h-[5.5rem]"
                    placeholder="Escribe un comentario para comunicarte con la otra parte..."
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={addComment.isPending || !commentText.trim()}
                      className="btn-primary inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {addComment.isPending ? (
                        <span className={formStyles.loadingSpinner} aria-hidden />
                      ) : (
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                      {addComment.isPending ? 'Enviando…' : 'Enviar comentario'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <ConfirmCancelMaterialRequestModal
          isOpen={showCancelConfirm && !!materialRequest}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={async () => {
            if (!materialRequest) return;
            await cancelRequest.mutateAsync({
              id: materialRequest.id,
              notes: isAdmin
                ? 'Cancelado por administrador'
                : 'Cancelado por solicitante',
            });
            setShowCancelConfirm(false);
            refetch();
          }}
          requestCode={materialRequest.request_code || `#${materialRequest.id}`}
          wasApproved={materialRequest.status === 'approved'}
          isConfirming={cancelRequest.isPending}
        />
      </PageWrapper>
    </>
  );
};
