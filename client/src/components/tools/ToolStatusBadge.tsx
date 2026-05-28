import type { ToolStatus, ToolStatusOption } from '../../types';

interface ToolStatusBadgeProps {
  status: ToolStatus | ToolStatusOption;
  className?: string;
}

const statusLabels: Record<ToolStatus, string> = {
  available: 'Disponible',
  assigned: 'Asignada',
  maintenance: 'En Mantenimiento',
  lost: 'Perdida',
  retired: 'Retirada',
};

const statusColors: Record<ToolStatus, string> = {
  available: 'bg-emerald-100 text-emerald-950',
  assigned: 'bg-sky-100 text-sky-950',
  maintenance: 'bg-amber-100 text-amber-950',
  lost: 'bg-rose-100 text-rose-950',
  retired: 'bg-slate-200 text-slate-800',
};

export const ToolStatusBadge: React.FC<ToolStatusBadgeProps> = ({ status, className = '' }) => {
  const statusValue = typeof status === 'string' ? status : status.value;
  const statusLabel = typeof status === 'string' ? statusLabels[statusValue] : status.label;
  const colorClass = typeof status === 'string' ? statusColors[statusValue] : status.color;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ring-black/15 ${colorClass} ${className}`}
    >
      {statusLabel}
    </span>
  );
};

