import type { EquipmentStatus, EquipmentStatusOption } from '../../types';

interface StatusBadgeProps {
  status: EquipmentStatus | EquipmentStatusOption;
  className?: string;
}

const statusLabels: Record<EquipmentStatus, string> = {
  available: 'Disponible',
  assigned: 'Asignado',
  maintenance: 'En Mantenimiento',
  retired: 'Retirado',
};

const statusColors: Record<EquipmentStatus, string> = {
  available: 'bg-emerald-100 text-emerald-950',
  assigned: 'bg-sky-100 text-sky-950',
  maintenance: 'bg-amber-100 text-amber-950',
  retired: 'bg-slate-200 text-slate-800',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
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
