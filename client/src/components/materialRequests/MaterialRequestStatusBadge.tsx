import React from 'react';
import type { MaterialRequestStatus } from '../../types';
import { materialRequestStatusLabels } from '../../utils/materialRequestDisplay';

const statusBadgeStyles: Record<MaterialRequestStatus, string> = {
  pending: 'bg-amber-100 text-amber-900',
  approved: 'bg-emerald-100 text-emerald-900',
  rejected: 'bg-rose-100 text-rose-900',
  cancelled: 'bg-slate-200 text-slate-800',
};

interface MaterialRequestStatusBadgeProps {
  status: MaterialRequestStatus;
  className?: string;
}

export const MaterialRequestStatusBadge: React.FC<MaterialRequestStatusBadgeProps> = ({
  status,
  className = '',
}) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeStyles[status]} ${className}`.trim()}
  >
    {materialRequestStatusLabels[status]}
  </span>
);
