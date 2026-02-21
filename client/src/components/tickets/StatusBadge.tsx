import type { EstadoTicket } from '../../types';

interface StatusBadgeProps {
  estado: EstadoTicket | string;
  /**
   * Permite forzar el color del badge cuando solo se tiene el nombre del estado
   * (por ejemplo, al listar tickets con `estado_nombre` y `estado_color`).
   */
  colorOverride?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  estado,
  colorOverride,
  className = '',
}) => {
  const estadoNombre = typeof estado === 'string' ? estado : estado.name;

  const baseColor =
    typeof estado === 'string'
      ? 'bg-gray-100'
      : estado.color || 'bg-gray-100';

  const estadoColor = colorOverride || baseColor;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoColor} text-gray-800 ${className}`}
    >
      {estadoNombre}
    </span>
  );
};
