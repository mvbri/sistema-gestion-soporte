import type { MaterialRequestStatus } from '../types';

export const materialRequestStatusLabels: Record<MaterialRequestStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
};

/** Colores alineados con los badges de la UI (fondo / texto) para PDF. */
export const materialRequestStatusPdfColors: Record<
  MaterialRequestStatus,
  { bg: [number, number, number]; fg: [number, number, number] }
> = {
  pending: { bg: [254, 243, 199], fg: [120, 53, 15] },
  approved: { bg: [209, 250, 229], fg: [6, 78, 59] },
  rejected: { bg: [255, 228, 230], fg: [136, 19, 55] },
  cancelled: { bg: [226, 232, 240], fg: [30, 41, 59] },
};

const PDF_FALLBACK_COLORS = { bg: [241, 245, 249] as [number, number, number], fg: [51, 65, 85] as [number, number, number] };

export function getMaterialRequestStatusLabel(raw: string | null | undefined): string {
  if (!raw) return '—';
  const key = raw.toLowerCase().trim() as MaterialRequestStatus;
  if (key in materialRequestStatusLabels) return materialRequestStatusLabels[key];
  return raw;
}

export function getMaterialRequestStatusPdfColors(
  raw: string | null | undefined
): { bg: [number, number, number]; fg: [number, number, number] } {
  if (!raw) return PDF_FALLBACK_COLORS;
  const key = raw.toLowerCase().trim() as MaterialRequestStatus;
  if (key in materialRequestStatusPdfColors) return materialRequestStatusPdfColors[key];
  return PDF_FALLBACK_COLORS;
}

export function materialRequestItemTypeLabel(type: string): string {
  switch (type) {
    case 'equipment':
      return 'Equipo';
    case 'consumable':
      return 'Consumible';
    case 'tool':
      return 'Herramienta';
    case 'manual':
      return 'Material (manual)';
    default:
      return type;
  }
}
