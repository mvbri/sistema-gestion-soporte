import type { EstadoTicket } from '../../types';

interface StatusBadgeProps {
  estado: EstadoTicket | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ estado, className = '' }) => {
  const estadoNombre = typeof estado === 'string' ? estado : estado.nombre;
  const estadoColor = typeof estado === 'string' ? 'bg-gray-100' : estado.color;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoColor} text-gray-800 ${className}`}
    >
      {estadoNombre}
    </span>
  );
};
