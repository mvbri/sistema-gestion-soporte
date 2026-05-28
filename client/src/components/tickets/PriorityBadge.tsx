import type { PrioridadTicket } from '../../types';
import { normalizeBadgeClassName } from '../../utils/badgeContrast';

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
  const prioridadNombre = typeof prioridad === 'string' ? prioridad : prioridad.name;

  const baseColor =
    typeof prioridad === 'string'
      ? 'bg-gray-100'
      : prioridad.color || 'bg-gray-100';

  const prioridadColor = normalizeBadgeClassName(
    (colorOverride && colorOverride.trim()) || baseColor
  );

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ring-black/20 shadow-sm ${prioridadColor} ${className}`}
    >
      {prioridadNombre}
    </span>
  );
};
