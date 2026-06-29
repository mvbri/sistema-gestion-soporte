import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserProfileIcon } from '../icons/UserProfileIcon';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <div className="flex items-center space-x-4 relative" ref={userMenuRef}>
      <button
        type="button"
        onClick={() => setUserMenuOpen((prev) => !prev)}
        className="flex items-center space-x-3 px-2 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      >
        <div className="h-9 w-9 rounded-full bg-sky-500/30 border border-sky-400/40 flex items-center justify-center">
          <UserProfileIcon className="h-5 w-5 text-white" />
        </div>
        <span className="text-sm font-medium text-white hidden sm:inline">
          {user?.full_name}
        </span>
        <svg
          className={`h-4 w-4 text-white transition-transform duration-200 ${
            userMenuOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {userMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-xl py-2 z-20 bg-gradient-to-b from-slate-950/[0.99] via-sky-950/[0.98] to-slate-950/[0.99] backdrop-blur-md border border-sky-400/35 shadow-2xl shadow-sky-950/60">
          <div className="px-4 py-3 border-b border-sky-400/25">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-white">
                {user?.full_name}
              </p>
              {user?.role === 'administrator' && (
                <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-sky-500/30 text-sky-100 border border-sky-400/40">
                  Administrador
                </span>
              )}
              {user?.role === 'technician' && (
                <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/30 text-blue-100 border border-blue-400/40">
                  Técnico
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen(false);
              navigate('/perfil');
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-blue-50 hover:bg-slate-800/60 transition-colors"
          >
            Actualizar información
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm text-blue-50 hover:bg-slate-800/60 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};
