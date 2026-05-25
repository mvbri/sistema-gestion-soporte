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
            ? 'bg-sky-500/25 text-sky-100 ring-1 ring-sky-400/50 shadow-sm'
            : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md border-l-4 border-sky-300'
          : isSubitem
            ? 'text-blue-100/80 hover:bg-slate-800/60 hover:text-white'
            : 'text-blue-50/90 hover:bg-slate-800/50 hover:text-white'
      }`}
    >
      {isSubitem ? (
        <span
          aria-hidden="true"
          className="flex h-5 w-4 flex-shrink-0 items-center justify-center"
        >
          <span
            className={`rounded-full ${
              isActive ? 'h-1.5 w-1.5 bg-sky-300' : 'h-1.5 w-1.5 bg-slate-500'
            }`}
          />
        </span>
      ) : (
        Icon && (
          <Icon
            className={`flex-shrink-0 h-5 w-5 ${
              isActive ? 'text-white' : 'text-blue-200/80'
            }`}
          />
        )
      )}
      <span>{label}</span>
    </Link>
  );
};
