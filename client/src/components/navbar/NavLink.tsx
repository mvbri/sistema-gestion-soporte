import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkProps {
  path: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export const NavLink: React.FC<NavLinkProps> = ({
  path,
  label,
  isActive,
  onClick,
  icon: Icon,
}) => {
  return (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
        isActive
          ? 'bg-blue-500 text-white shadow-sm border-l-4 border-blue-600'
          : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      {Icon && (
        <Icon
          className={`flex-shrink-0 h-5 w-5 ${
            isActive ? 'text-white' : 'text-gray-600'
          }`}
        />
      )}
      <span>{label}</span>
    </Link>
  );
};
