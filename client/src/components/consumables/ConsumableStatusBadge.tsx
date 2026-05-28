import type { ConsumableStatus, ConsumableStatusOption } from '../../types';

interface ConsumableStatusBadgeProps {
  status: ConsumableStatus | ConsumableStatusOption;
  className?: string;
}

const statusLabels: Record<ConsumableStatus, string> = {
  available: 'Disponible',
  low_stock: 'Stock Bajo',
  out_of_stock: 'Sin Stock',
  inactive: 'Inactivo',
};

const statusColors: Record<ConsumableStatus, string> = {
  available: 'bg-emerald-100 text-emerald-950',
  low_stock: 'bg-amber-100 text-amber-950',
  out_of_stock: 'bg-rose-100 text-rose-950',
  inactive: 'bg-slate-200 text-slate-800',
};

export const ConsumableStatusBadge: React.FC<ConsumableStatusBadgeProps> = ({ status, className = '' }) => {
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

