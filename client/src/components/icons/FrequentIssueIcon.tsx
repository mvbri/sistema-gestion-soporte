import React from 'react';
import { TriangleAlert } from 'lucide-react';

interface FrequentIssueIconProps {
  className?: string;
}

/** Triángulo con exclamación — fallas / advertencia (Lucide `TriangleAlert`). */
export const FrequentIssueIcon: React.FC<FrequentIssueIconProps> = ({ className = 'h-5 w-5' }) => (
  <TriangleAlert className={className} strokeWidth={1.75} aria-hidden />
);
