import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Ticket } from '../types';

const INSTITUTION_LOGO_PATH = '/alcado.png';

const PDF_ENTITY = 'Alcaldía Angostura del Orinoco';
const PDF_SYSTEM = 'Sistema de Gestión de Soporte Técnico';
const PDF_DOC_TITLE = 'Informe de atención y cierre de ticket';

const MARGIN = 18;
const TEXT_MUTED: [number, number, number] = [100, 116, 139];
const LINE_COLOR: [number, number, number] = [203, 213, 225];
const HEADER_BLUE: [number, number, number] = [74, 111, 165];
const HEADER_BLUE_DARK: [number, number, number] = [52, 78, 120];

export interface TicketPdfInput {
  ticket: Ticket;
}

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

function formatPdfDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

function drawSectionTitle(doc: jsPDF, title: string, y: number, pageW: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(title, MARGIN, y);
  doc.setDrawColor(...LINE_COLOR);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y + 2, pageW - MARGIN, y + 2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  return y + 8;
}

function drawField(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  maxWidth: number
): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(label, x, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const lines = doc.splitTextToSize(value, maxWidth);
  doc.text(lines, x, y + 4.5);
  return 4.5 + lines.length * 4.2 + 3;
}

function drawMetaBlock(
  doc: jsPDF,
  ticketId: string,
  emissionDate: string,
  y: number,
  contentWidth: number
): number {
  const blockPad = 3;
  const valueX = MARGIN + 42;
  const valueMaxW = contentWidth - 42 - blockPad;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const idLines = doc.splitTextToSize(ticketId, valueMaxW);
  const blockH = Math.max(16, 11 + (idLines.length > 1 ? (idLines.length - 1) * 3.5 : 0));

  doc.setDrawColor(...LINE_COLOR);
  doc.setLineWidth(0.2);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(MARGIN, y, contentWidth, blockH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Código del ticket', MARGIN + blockPad, y + 4);
  doc.text('Fecha y hora de emisión', MARGIN + blockPad, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(idLines, valueX, y + 4);
  doc.text(emissionDate, valueX, y + 11);

  return blockH + 6;
}

function drawFieldRow(
  doc: jsPDF,
  fields: Array<{ label: string; value: string }>,
  y: number,
  contentWidth: number
): number {
  const gap = 8;
  const colW = (contentWidth - gap * (fields.length - 1)) / fields.length;
  let maxH = 0;

  fields.forEach((field, index) => {
    const x = MARGIN + index * (colW + gap);
    const h = drawField(doc, field.label, field.value, x, y, colW);
    maxH = Math.max(maxH, h);
  });

  return maxH;
}

function drawSignatureBlocks(doc: jsPDF, pageW: number, y: number): number {
  const sigGap = 8;
  const sigColW = (pageW - 2 * MARGIN - 2 * sigGap) / 3;
  const sigBoxH = 28;

  const blocks = [
    { label: 'Usuario solicitante', subtitle: 'Firma' },
    { label: 'Técnico responsable', subtitle: 'Firma' },
    { label: 'Director(a) de Informática', subtitle: 'Visto bueno — Firma y sello' },
  ] as const;

  let sigX = MARGIN;
  for (const block of blocks) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(block.label, sigX + sigColW / 2, y + 4, { align: 'center' });

    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.3);
    const lineY = y + 18;
    doc.line(sigX + 4, lineY, sigX + sigColW - 4, lineY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(block.subtitle, sigX + sigColW / 2, lineY + 4, { align: 'center' });

    sigX += sigColW + sigGap;
  }

  return y + sigBoxH;
}

function drawLogoHeader(
  doc: jsPDF,
  pageW: number,
  logoDataUrl: string | null
): number {
  const headerH = 26;
  const logoW = 52;
  const logoH = 14;
  const logoPad = 3;

  doc.setFillColor(...HEADER_BLUE);
  doc.rect(0, 0, pageW, headerH, 'F');
  doc.setFillColor(...HEADER_BLUE_DARK);
  doc.rect(0, headerH - 1.5, pageW, 1.5, 'F');

  if (logoDataUrl) {
    doc.setFillColor(...HEADER_BLUE);
    doc.roundedRect(MARGIN - 2, 6, logoW + logoPad * 2, logoH + logoPad * 2, 1, 1, 'F');
    doc.addImage(logoDataUrl, 'PNG', MARGIN + logoPad - 2, 6 + logoPad, logoW, logoH);
  }

  const textX = MARGIN + logoW + logoPad * 2 + 4;
  const textMaxW = pageW - textX - MARGIN;

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(PDF_DOC_TITLE, textX, 11, { maxWidth: textMaxW });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(PDF_ENTITY, textX, 17, { maxWidth: textMaxW });
  doc.text(PDF_SYSTEM, textX, 21.5, { maxWidth: textMaxW });
  doc.setTextColor(0, 0, 0);

  return headerH + 10;
}

/**
 * Genera y descarga un PDF del ticket para archivo y visto bueno del Director de Informática.
 */
export async function downloadTicketPdf({ ticket }: TicketPdfInput): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const contentWidth = pageW - 2 * MARGIN;

  const logoDataUrl = await loadPublicImageAsDataUrl(INSTITUTION_LOGO_PATH);
  let y = drawLogoHeader(doc, pageW, logoDataUrl);

  y += drawMetaBlock(doc, String(ticket.id), formatPdfDate(new Date().toISOString()), y, contentWidth);

  y = drawSectionTitle(doc, 'Identificación', y, pageW);
  y += drawField(doc, 'Título', ticket.title || '—', MARGIN, y, contentWidth);
  y += drawFieldRow(
    doc,
    [
      { label: 'Prioridad', value: ticket.priority_name || '—' },
      { label: 'Categoría', value: ticket.category_name || '—' },
    ],
    y,
    contentWidth
  );
  y += drawField(doc, 'Área del incidente', ticket.incident_area_name || '—', MARGIN, y, contentWidth);

  y = drawSectionTitle(doc, 'Datos de la solicitud', y + 2, pageW);
  y += drawFieldRow(
    doc,
    [
      { label: 'Reportado por', value: ticket.created_by_user_name || '—' },
      { label: 'Técnico asignado', value: ticket.assigned_technician_name || 'Sin asignar' },
    ],
    y,
    contentWidth
  );
  y += drawFieldRow(
    doc,
    [
      { label: 'Fecha de creación', value: formatPdfDate(ticket.created_at) },
      { label: 'Fecha de resolución', value: formatPdfDate(ticket.resolved_at) },
    ],
    y,
    contentWidth
  );
  y += drawField(doc, 'Fecha de cierre', formatPdfDate(ticket.closed_at), MARGIN, y, contentWidth);
  y += drawField(
    doc,
    'Descripción',
    ticket.description?.trim() || 'Sin descripción registrada.',
    MARGIN,
    y,
    contentWidth
  );

  if (ticket.closure_reason?.trim()) {
    y += drawField(doc, 'Motivo de cierre', ticket.closure_reason.trim(), MARGIN, y, contentWidth);
  }

  const equipment = ticket.equipment || [];
  if (equipment.length > 0) {
    y = drawSectionTitle(doc, 'Equipos asociados', y + 2, pageW);
    autoTable(doc, {
      startY: y,
      head: [['N°', 'Equipo', 'Marca / modelo', 'Serie']],
      body: equipment.map((item, index) => [
        String(index + 1),
        item.name || '—',
        [item.brand, item.model].filter(Boolean).join(' ') || '—',
        item.serial_number || '—',
      ]),
      styles: {
        fontSize: 8.5,
        cellPadding: 2.5,
        lineColor: LINE_COLOR,
        lineWidth: 0.1,
        textColor: [30, 41, 59],
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontStyle: 'bold',
        halign: 'left',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        3: { cellWidth: 30 },
      },
      margin: { left: MARGIN, right: MARGIN },
    });
    y =
      ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? y + 24) + 10;
  }

  y = drawSectionTitle(doc, 'Autorizaciones', y + 2, pageW);
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(
    'Documento para constancia administrativa. El sello oficial corresponde únicamente al Director de Informática.',
    MARGIN,
    y
  );
  y += 8;
  drawSignatureBlocks(doc, pageW, y);

  const footerY = pageH - 12;
  doc.setDrawColor(...LINE_COLOR);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, footerY - 4, pageW - MARGIN, footerY - 4);
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Generado el ${formatPdfDate(new Date().toISOString())}`, MARGIN, footerY);
  doc.text(`Página ${doc.getCurrentPageInfo().pageNumber}`, pageW - MARGIN, footerY, {
    align: 'right',
  });

  const safeTitle = (ticket.title || 'ticket')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 40);
  doc.save(`ticket_${safeTitle || ticket.id.slice(0, 8)}.pdf`);
}
