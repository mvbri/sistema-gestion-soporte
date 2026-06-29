import { RED_OUTLINE_BADGE_STYLE } from './PriorityBadge';

interface ReopenedBadgeProps {
  className?: string;
}

export const ReopenedBadge: React.FC<ReopenedBadgeProps> = ({ className = '' }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${RED_OUTLINE_BADGE_STYLE} ${className}`}
  >
    Reabierto
  </span>
);
