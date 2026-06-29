import type { EstadoTicket } from '../../types';
import { normalizeBadgeClassName } from '../../utils/badgeContrast';

/** Estilo oscuro fijo para estados "inactivos" (independiente de overrides de .app-shell). */
const CLOSED_BADGE_STYLE =
  'bg-slate-600/55 text-slate-50 ring-1 ring-inset ring-white/10';

const STATE_NAME_STYLES: Record<string, string> = {
  cerrado: CLOSED_BADGE_STYLE,
  closed: CLOSED_BADGE_STYLE,
};

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

  const namedStyle = STATE_NAME_STYLES[estadoNombre.trim().toLowerCase()];

  const estadoColor =
    namedStyle ??
    normalizeBadgeClassName((colorOverride && colorOverride.trim()) || baseColor);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
        namedStyle ? estadoColor : `ring-1 ring-inset ring-black/20 ${estadoColor}`
      } ${className}`}
    >
      {estadoNombre}
    </span>
  );
};
