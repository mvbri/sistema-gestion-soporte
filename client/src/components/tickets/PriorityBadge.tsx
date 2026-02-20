import type { PrioridadTicket } from '../../types';

interface PriorityBadgeProps {
  prioridad: PrioridadTicket | string;
  /**
   * Permite forzar el color del badge cuando solo se tiene el nombre de la prioridad
   * (por ejemplo, al listar tickets con `prioridad_nombre` y `prioridad_color`).
   */
  colorOverride?: string;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  prioridad,
  colorOverride,
  className = '',
}) => {
  const prioridadNombre = typeof prioridad === 'string' ? prioridad : prioridad.nombre;

  const baseColor =
    typeof prioridad === 'string'
      ? 'bg-gray-100'
      : prioridad.color || 'bg-gray-100';

  const prioridadColor = colorOverride || baseColor;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prioridadColor} text-gray-800 ${className}`}
    >
      {prioridadNombre}
    </span>
  );
};
