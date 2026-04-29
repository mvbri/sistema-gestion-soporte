import React from 'react';
import { Link } from 'react-router-dom';

interface NavLinkProps {
  path: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'subitem';
}

export const NavLink: React.FC<NavLinkProps> = ({
  path,
  label,
  isActive,
  onClick,
  icon: Icon,
  variant = 'default',
}) => {
  const isSubitem = variant === 'subitem';

  return (
    <Link
      to={path}
      onClick={onClick}
      className={`relative flex items-center gap-2.5 rounded-lg font-medium transition-all duration-200 ${
        isSubitem ? 'px-3 py-2.5 text-sm' : 'gap-3 px-4 py-3 text-base'
      } ${
        isActive
          ? isSubitem
            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/80 shadow-sm'
            : 'bg-blue-500 text-white shadow-sm border-l-4 border-blue-600'
          : isSubitem
            ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      {isSubitem ? (
        <span
          aria-hidden="true"
          className="flex h-5 w-4 flex-shrink-0 items-center justify-center"
        >
          <span
            className={`rounded-full ${
              isActive ? 'h-1.5 w-1.5 bg-blue-600' : 'h-1.5 w-1.5 bg-gray-400'
            }`}
          />
        </span>
      ) : (
        Icon && (
          <Icon
            className={`flex-shrink-0 h-5 w-5 ${
              isActive ? 'text-white' : 'text-gray-600'
            }`}
          />
        )
      )}
      <span>{label}</span>
    </Link>
  );
};
