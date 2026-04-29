import React from 'react';

interface HandRequestIconProps {
  className?: string;
}

export const HandRequestIcon: React.FC<HandRequestIconProps> = ({ className = 'h-5 w-5' }) => {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.75 11.5V6.25a1.25 1.25 0 112.5 0v3.5m0 1.75V5.5a1.25 1.25 0 112.5 0v6m0-.5v-4a1.25 1.25 0 112.5 0v5m0 0V8.75a1.25 1.25 0 112.5 0V14c0 3.45-2.8 6.25-6.25 6.25S6.25 17.45 6.25 14v-2.75a1.25 1.25 0 112.5 0v.25"
      />
    </svg>
  );
};
