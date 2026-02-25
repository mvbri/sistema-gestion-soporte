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
  available: 'bg-green-100 text-green-800',
  low_stock: 'bg-yellow-100 text-yellow-800',
  out_of_stock: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-800',
};

export const ConsumableStatusBadge: React.FC<ConsumableStatusBadgeProps> = ({ status, className = '' }) => {
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

