import React from 'react';

interface CreateTicketIconProps {
  className?: string;
}

export const CreateTicketIcon: React.FC<CreateTicketIconProps> = ({ className = 'h-5 w-5' }) => {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
};
