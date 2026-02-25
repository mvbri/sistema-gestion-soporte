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
  available: 'bg-green-100 text-green-800',
  assigned: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  lost: 'bg-red-100 text-red-800',
  retired: 'bg-gray-100 text-gray-800',
};

export const ToolStatusBadge: React.FC<ToolStatusBadgeProps> = ({ status, className = '' }) => {
  const statusValue = typeof status === 'string' ? status : status.value;
  const statusLabel = typeof status === 'string' ? statusLabels[statusValue] : status.label;
  const colorClass = typeof status === 'string' ? statusColors[statusValue] : status.color;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {statusLabel}
    </span>
  );
};

