import React from 'react';

interface MenuToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
  ariaLabel: string;
}

export const MenuToggleButton: React.FC<MenuToggleButtonProps> = ({
  isOpen,
  onClick,
  ariaLabel,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-blue-100 hover:bg-blue-400/20 focus:outline-none transition-colors"
      aria-label={ariaLabel}
      aria-expanded={isOpen}
    >
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        {isOpen ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );
};
