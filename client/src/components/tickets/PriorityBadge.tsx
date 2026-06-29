import type { PrioridadTicket } from '../../types';
import { normalizeBadgeClassName } from '../../utils/badgeContrast';

export const RED_OUTLINE_BADGE_STYLE =
  'border border-red-500 bg-red-500/10 text-red-500 ring-1 ring-inset ring-red-500/35';

/** Estilos fijos por nombre (evitan overrides de .app-shell en text-gray-900). */
const PRIORITY_NAME_STYLES: Record<string, string> = {
  alta: RED_OUTLINE_BADGE_STYLE,
  urgente: RED_OUTLINE_BADGE_STYLE,
};

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

  const namedStyle = PRIORITY_NAME_STYLES[prioridadNombre.trim().toLowerCase()];

  const prioridadColor =
    namedStyle ??
    normalizeBadgeClassName((colorOverride && colorOverride.trim()) || baseColor);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
        namedStyle ? prioridadColor : `ring-1 ring-inset ring-black/20 ${prioridadColor}`
      } ${className}`}
    >
      {prioridadNombre}
    </span>
  );
};
