import React from 'react';

/** Llave de vaso en T (aprieta tuercas: barra + vástago + cubo hexagonal). */
interface FrequentIssueIconProps {
  className?: string;
}

export const FrequentIssueIcon: React.FC<FrequentIssueIconProps> = ({ className = 'h-5 w-5' }) => {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden
    >
      {/* Barra y vástago (forma en T) */}
      <path strokeLinecap="round" d="M6 4.5h12M12 4.5V16.5" />
      {/* Vaso hexagonal: caras superior e inferior horizontales */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.4 16.5h7.2l2.4 1.65v3.7l-2.4 1.65H8.4l-2.4-1.65v-3.7l2.4-1.65z"
      />
    </svg>
  );
};
