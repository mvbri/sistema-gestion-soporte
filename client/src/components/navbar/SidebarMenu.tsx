import React, { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMenu } from '../../contexts/MenuContext';
import { useAuth } from '../../hooks/useAuth';
import { MenuToggleButton } from './MenuToggleButton';
import { NavLink } from './NavLink';
import { DashboardIcon } from '../icons/DashboardIcon';
import { TicketsIcon } from '../icons/TicketsIcon';
import { AnalyticsIcon } from '../icons/AnalyticsIcon';
import { SettingsIcon } from '../icons/SettingsIcon';
import { CreateTicketIcon } from '../icons/CreateTicketIcon';

export const SidebarMenu: React.FC = () => {
  const { menuOpen, setMenuOpen } = useMenu();
  const { user } = useAuth();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [setMenuOpen]);

  const isActive = (path: string) => {
    if (location.pathname === path) {
      return true;
    }

    if (path === '/tickets') {
      return (
        location.pathname.startsWith('/tickets') &&
        !location.pathname.startsWith('/tickets/dashboard') &&
        !location.pathname.startsWith('/tickets/crear') &&
        location.pathname !== '/analytics'
      );
    }

    if (path === '/tickets/crear') {
      return location.pathname === '/tickets/crear';
    }

    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }

    if (path === '/tecnico/dashboard') {
      return location.pathname === '/tecnico/dashboard';
    }

    if (path === '/analytics') {
      return location.pathname === '/analytics';
    }

    return location.pathname.startsWith(path + '/');
  };

  const navLinks = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: DashboardIcon,
      show: user?.role === 'administrator' || user?.role === 'end_user' || user?.role === 'technician',
    },
    {
      path: '/tecnico/dashboard',
      label: 'Panel del Técnico',
      icon: DashboardIcon,
      show: user?.role === 'technician',
    },
    { path: '/tickets', label: 'Ver Tickets', icon: TicketsIcon, show: true },
    {
      path: '/tickets/crear',
      label: 'Crear Ticket',
      icon: CreateTicketIcon,
      show: user?.role === 'end_user',
    },
    {
      path: '/analytics',
      label: 'Analíticas',
      icon: AnalyticsIcon,
      show: user?.role === 'administrator',
    },
    {
      path: '/admin/config',
      label: 'Configuración',
      icon: SettingsIcon,
      show: user?.role === 'administrator',
    },
  ].filter((link) => link.show);

  return (
    <div
      ref={menuRef}
      className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
        menuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="pb-4">
        <div className="px-5 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            <MenuToggleButton
              isOpen={menuOpen}
              onClick={() => setMenuOpen(false)}
              ariaLabel="Cerrar menú"
            />
            <Link
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors flex-1"
            >
              Gestión de Soporte Técnico
            </Link>
          </div>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              path={link.path}
              label={link.label}
              icon={link.icon}
              isActive={isActive(link.path)}
              onClick={() => setMenuOpen(false)}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};
