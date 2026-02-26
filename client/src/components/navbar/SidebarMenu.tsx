import React, { useRef, useEffect, useState } from 'react';
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
import { EquipmentIcon } from '../icons/EquipmentIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { ConsumablesIcon } from '../icons/ConsumablesIcon';
import { ToolsIcon } from '../icons/ToolsIcon';
import { TicketAnalyticsIcon } from '../icons/TicketAnalyticsIcon';
import { EquipmentAnalyticsIcon } from '../icons/EquipmentAnalyticsIcon';
import { ConsumablesAnalyticsIcon } from '../icons/ConsumablesAnalyticsIcon';
import { BackupIcon } from '../icons/BackupIcon';

export const SidebarMenu: React.FC = () => {
  const { menuOpen, setMenuOpen } = useMenu();
  const { user } = useAuth();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

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

  useEffect(() => {
    const pathname = location.pathname;
    setInventoryOpen(
      pathname.startsWith('/equipment') ||
      pathname.startsWith('/consumables') ||
      pathname.startsWith('/tools')
    );
    setAnalyticsOpen(
      pathname === '/analytics' ||
      pathname.startsWith('/equipment/analytics') ||
      pathname.startsWith('/consumables/analytics')
    );
  }, [location.pathname]);

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

    if (path === '/admin/users') {
      return location.pathname.startsWith('/admin/users');
    }

    if (path === '/admin/backup') {
      return location.pathname.startsWith('/admin/backup');
    }

    if (path === '/admin/config') {
      return location.pathname.startsWith('/admin/config');
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
    { path: '/tickets', label: 'Tickets', icon: TicketsIcon, show: true },
    {
      path: '/tickets/crear',
      label: 'Crear Ticket',
      icon: CreateTicketIcon,
      show: user?.role === 'end_user',
    },
    {
      path: '/admin/users',
      label: 'Gestión de Usuarios',
      icon: UsersIcon,
      show: user?.role === 'administrator',
    },
  ].filter((link) => link.show);

  return (
    <div
      ref={menuRef}
      className={`fixed top-0 left-0 h-full w-80 shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
        menuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ backgroundColor: '#5B7FA8' }}
    >
      <div className="pb-4">
        <div className="px-5 py-5 border-b border-blue-400/30" style={{ backgroundColor: '#4A6FA5' }}>
          <div className="flex items-center space-x-3">
            <MenuToggleButton
              isOpen={menuOpen}
              onClick={() => setMenuOpen(false)}
              ariaLabel="Cerrar menú"
            />
            <Link
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="flex items-center space-x-2 text-lg font-bold text-white hover:text-blue-100 transition-colors flex-1"
            >
              <img
                src="/alcado.webp"
                alt="Logo Alcaldía"
                className="h-8 w-auto object-contain"
              />
              <span>Gestión de Soporte Técnico</span>
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

          {/* Grupo Inventario */}
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setInventoryOpen(!inventoryOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                inventoryOpen
                  ? 'bg-blue-400/30 text-white shadow-sm border-l-4 border-blue-200'
                  : 'text-blue-50 hover:bg-blue-400/20 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <EquipmentIcon
                  className={`flex-shrink-0 h-5 w-5 ${
                    inventoryOpen ? 'text-white' : 'text-blue-200'
                  }`}
                />
                <span>Inventario</span>
              </span>
              <svg
                className={`h-4 w-4 transform transition-transform ${
                  inventoryOpen ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {inventoryOpen && (
              <div className="mt-1 space-y-1 ml-6">
                <NavLink
                  path="/equipment"
                  label="Equipos"
                  icon={EquipmentIcon}
                  isActive={isActive('/equipment')}
                  onClick={() => setMenuOpen(false)}
                />
                <NavLink
                  path="/consumables"
                  label="Consumibles"
                  icon={ConsumablesIcon}
                  isActive={isActive('/consumables')}
                  onClick={() => setMenuOpen(false)}
                />
                <NavLink
                  path="/tools"
                  label="Herramientas"
                  icon={ToolsIcon}
                  isActive={isActive('/tools')}
                  onClick={() => setMenuOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Grupo Analíticas */}
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setAnalyticsOpen(!analyticsOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                analyticsOpen
                  ? 'bg-blue-400/30 text-white shadow-sm border-l-4 border-blue-200'
                  : 'text-blue-50 hover:bg-blue-400/20 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <AnalyticsIcon
                  className={`flex-shrink-0 h-5 w-5 ${
                    analyticsOpen ? 'text-white' : 'text-blue-200'
                  }`}
                />
                <span>Analíticas</span>
              </span>
              <svg
                className={`h-4 w-4 transform transition-transform ${
                  analyticsOpen ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {analyticsOpen && (
              <div className="mt-1 space-y-1 ml-6">
                <NavLink
                  path="/analytics"
                  label="Analíticas de Tickets"
                  icon={TicketAnalyticsIcon}
                  isActive={isActive('/analytics')}
                  onClick={() => setMenuOpen(false)}
                />
                <NavLink
                  path="/equipment/analytics"
                  label="Analíticas de Equipos"
                  icon={EquipmentAnalyticsIcon}
                  isActive={isActive('/equipment/analytics')}
                  onClick={() => setMenuOpen(false)}
                />
                <NavLink
                  path="/consumables/analytics"
                  label="Analíticas de Consumibles"
                  icon={ConsumablesAnalyticsIcon}
                  isActive={isActive('/consumables/analytics')}
                  onClick={() => setMenuOpen(false)}
                />
              </div>
            )}
          </div>

          {/* Respaldo y Restauración */}
          {user?.role === 'administrator' && (
            <NavLink
              path="/admin/backup"
              label="Respaldo y Restauración"
              icon={BackupIcon}
              isActive={isActive('/admin/backup')}
              onClick={() => setMenuOpen(false)}
            />
          )}

          {/* Configuración */}
          {user?.role === 'administrator' && (
            <NavLink
              path="/admin/config"
              label="Configuración"
              icon={SettingsIcon}
              isActive={isActive('/admin/config')}
              onClick={() => setMenuOpen(false)}
            />
          )}
        </nav>
      </div>
    </div>
  );
};
