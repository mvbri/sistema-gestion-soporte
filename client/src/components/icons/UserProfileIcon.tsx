import React from 'react';

interface UserProfileIconProps {
  className?: string;
}

export const UserProfileIcon: React.FC<UserProfileIconProps> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="3.25" />
    <path
      d="M6.75 18.5c0-2.35 2.35-4.25 5.25-4.25s5.25 1.9 5.25 4.25"
      strokeLinecap="round"
    />
  </svg>
);

