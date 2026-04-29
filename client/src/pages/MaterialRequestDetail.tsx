import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
      doc.text('Firma y sello', sigX + 2, lineY + 4);
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
          <div className="py-20 text-center text-gray-600">Cargando solicitud...</div>
        </PageWrapper>
      </>
    );
  }

  if (!materialRequest) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="py-20 text-center text-gray-600">Solicitud no encontrada.</div>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Solicitud{' '}
                  <span className="rounded-md bg-slate-50 px-2 py-0.5 font-semibold text-slate-700">
                    {materialRequest.request_code || `#${materialRequest.id}`}
                  </span>
                </h1>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
                  <span>Solicitante: {materialRequest.requester_name}</span>
                  <span className="hidden sm:inline text-gray-300" aria-hidden>
                    ·
                  </span>
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <span>Estado:</span>
                    <MaterialRequestStatusBadge status={materialRequest.status} />
                  </span>
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold text-gray-800">Nombre del destinatario:</span>{' '}
                  {materialRequest.addressee_name?.trim() || '—'}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-800">Cargo al que se dirige la solicitud:</span>{' '}
                  {materialRequest.addressee_title?.trim() || '—'}
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold text-gray-800">Funcionario que aprueba la solicitud:</span>{' '}
                  {materialRequest.approved_by_user_name?.trim() || '—'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/material-requests')}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  Volver
                </button>
                {canAdminReview && (
                  <>
                    <button
                      type="button"
                      onClick={async () => {
                        await approveRequest.mutateAsync({ id: materialRequest.id });
                        refetch();
                      }}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white"
                    >
                      Aprobar
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
                      className="rounded-lg bg-rose-600 px-3 py-2 text-sm text-white"
                    >
                      Rechazar
                    </button>
                  </>
                )}
                {canCancel && (
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    className="group inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white p-2 text-rose-600 shadow-sm transition hover:border-transparent hover:bg-gradient-to-r hover:from-rose-600 hover:to-red-600 hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                    title="Cancelar solicitud"
                    aria-label="Cancelar solicitud"
                  >
                    <svg
                      className="h-5 w-5 transition-transform group-hover:scale-105"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                  </button>
                )}
                {isAdmin && materialRequest.status === 'approved' && (
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white"
                  >
                    Imprimir PDF
                  </button>
                )}
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-700">
              <strong>Motivo:</strong> {materialRequest.request_notes || 'Sin notas'}
            </p>
            {materialRequest.addressee_addressing_text?.trim() ? (
              <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                <strong>Texto al destinatario:</strong> {materialRequest.addressee_addressing_text.trim()}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Materiales solicitados</h2>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Tipo</th>
                    <th className="px-3 py-2 text-left">Material</th>
                    <th className="px-3 py-2 text-left">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {materialRequest.items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-3 py-2">{materialRequestItemTypeLabel(item.material_type)}</td>
                      <td className="px-3 py-2">{item.material_name || `ID ${item.reference_id}`}</td>
                      <td className="px-3 py-2">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Historial</h2>
              <div className="space-y-3">
                {materialRequest.history.map((entry) => (
                  <div key={entry.id} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {entry.changed_by_user_name}
                      </span>
                      <MaterialRequestStatusBadge status={entry.new_status} />
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(entry.created_at)}</p>
                    {entry.notes && <p className="text-sm text-gray-700 mt-1">{entry.notes}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Comentarios</h2>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {materialRequest.comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border border-gray-200 p-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {comment.created_by_user_name} ({translateRole(comment.created_by_user_role)})
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.comment_text}</p>
                  </div>
                ))}
                {materialRequest.comments.length === 0 && (
                  <p className="text-sm text-gray-500">Aún no hay comentarios.</p>
                )}
              </div>
              <div className="mt-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Escribe un comentario para comunicarte con la otra parte..."
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!commentText.trim()) return;
                      await addComment.mutateAsync({
                        id: materialRequest.id,
                        commentText: commentText.trim(),
                      });
                      setCommentText('');
                      refetch();
                    }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Enviar comentario
                  </button>
                </div>
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
