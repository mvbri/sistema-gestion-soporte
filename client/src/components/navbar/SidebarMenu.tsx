import React, { useRef, useEffect, useState } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
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
import { FrequentIssueIcon } from '../icons/FrequentIssueIcon';
import { BackupIcon } from '../icons/BackupIcon';
import { ReportsIcon } from '../icons/ReportsIcon';
import { HandRequestIcon } from '../icons/HandRequestIcon';
import { LoansHandsIcon } from '../icons/LoansHandsIcon';

export const SidebarMenu: React.FC = () => {
  const { menuOpen, setMenuOpen } = useMenu();
  const { user } = useAuth();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [loansOpen, setLoansOpen] = useState(false);
  const [materialRequestsOpen, setMaterialRequestsOpen] = useState(false);
  const pathname = location.pathname;

  const matchesAnyRoute = (patterns: string[]) =>
    patterns.some((pattern) => Boolean(matchPath({ path: pattern, end: false }, pathname)));

  const isRouteActive = (pattern: string, end = false) =>
    Boolean(matchPath({ path: pattern, end }, pathname));

  const inventoryActive = matchesAnyRoute([
    '/equipment/*',
    '/consumables/*',
    '/tools/*',
  ]);
  const analyticsActive = matchesAnyRoute([
    '/analytics',
    '/equipment/analytics/*',
    '/consumables/analytics/*',
    '/loans/reports/*',
  ]);
  const loansActive = matchesAnyRoute([
    '/loans',
    '/loans/create',
    '/loans/history',
    '/loans/approval',
    '/loans/:id',
    '/loans/:id/*',
  ]);
  const materialRequestsActive = matchesAnyRoute(['/material-requests/*']);

  const canSeeInventoryMenu =
    user?.role === 'administrator' || user?.has_inventory_assignments === true;

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
    setInventoryOpen(inventoryActive);
    setAnalyticsOpen(analyticsActive);
    setLoansOpen(loansActive);
    setMaterialRequestsOpen(materialRequestsActive);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/tickets') {
      return (
        isRouteActive('/tickets/*') &&
        !isRouteActive('/tickets/dashboard/*') &&
        !isRouteActive('/tickets/crear', true) &&
        !isRouteActive('/analytics', true)
      );
    }

    if (path === '/tickets/crear') {
      return isRouteActive('/tickets/crear', true);
    }

    if (path === '/dashboard') {
      return isRouteActive('/dashboard', true);
    }

    if (path === '/tecnico/dashboard') {
      return isRouteActive('/tecnico/dashboard', true);
    }

    if (path === '/analytics') {
      return isRouteActive('/analytics', true);
    }

    if (path === '/admin/users') {
      return isRouteActive('/admin/users/*');
    }

    if (path === '/admin/frequent-issues') {
      return isRouteActive('/admin/frequent-issues/*');
    }

    if (path === '/admin/reports') {
      return isRouteActive('/admin/reports/*');
    }

    if (path === '/admin/backup') {
      return isRouteActive('/admin/backup/*');
    }

    if (path === '/admin/config') {
      return isRouteActive('/admin/config/*');
    }
    if (path === '/loans') {
      return matchesAnyRoute(['/loans', '/loans/create', '/loans/history', '/loans/approval', '/loans/:id', '/loans/:id/*']);
    }
    if (path === '/loans/reports') {
      return isRouteActive('/loans/reports/*');
    }
    if (path === '/material-requests') {
      if (pathname === '/material-requests') return true;
      const detail = matchPath({ path: '/material-requests/:id', end: true }, pathname);
      return Boolean(detail?.params.id && detail.params.id !== 'create');
    }
    if (path === '/material-requests/create') {
      return isRouteActive('/material-requests/create', true);
    }

    return isRouteActive(path, true) || isRouteActive(`${path}/*`);
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
    {
      path: '/admin/frequent-issues',
      label: 'Fallas frecuentes',
      icon: FrequentIssueIcon,
      show: user?.role === 'administrator',
    },
  ].filter((link) => link.show);

  return (
    <div
      ref={menuRef}
      className={`fixed top-0 left-0 h-full w-80 shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
        menuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="pb-4 h-full flex flex-col">
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
            </Link>
          </div>
        </div>
        <nav className="px-3 py-4 space-y-1 bg-gray-50 flex-1">
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

          <div className="mt-2">
            <button
              type="button"
              onClick={() => setMaterialRequestsOpen(!materialRequestsOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                materialRequestsActive
                  ? 'bg-blue-500 text-white shadow-sm border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-3">
                <HandRequestIcon
                  className={`flex-shrink-0 h-5 w-5 ${
                    materialRequestsActive ? 'text-white' : 'text-gray-600'
                  }`}
                />
                <span>Solicitudes de Materiales</span>
              </span>
              <svg
                className={`h-4 w-4 transform transition-transform ${materialRequestsOpen ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {materialRequestsOpen && (
              <div className="mt-1 space-y-1 ml-6">
                <NavLink
                  path="/material-requests/create"
                  label="Nueva solicitud"
                  variant="subitem"
                  isActive={isActive('/material-requests/create')}
                  onClick={() => setMenuOpen(false)}
                />
                <NavLink
                  path="/material-requests"
                  label={
                    user?.role === 'administrator' ? 'Listado de solicitudes' : 'Mis solicitudes'
                  }
                  variant="subitem"
                  isActive={isActive('/material-requests')}
                  onClick={() => setMenuOpen(false)}
                />
              </div>
            )}
          </div>

          <div className="mt-2">
            <button
              type="button"
              onClick={() => setLoansOpen(!loansOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                loansActive
                  ? 'bg-blue-500 text-white shadow-sm border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-3">
                <LoansHandsIcon
                  className={`flex-shrink-0 h-5 w-5 ${loansActive ? 'text-white' : 'text-gray-600'}`}
                />
                <span>Préstamos</span>
              </span>
              <svg
                className={`h-4 w-4 transform transition-transform ${loansOpen ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {loansOpen && (
              <div className="mt-1 space-y-1 ml-6">
                <NavLink
                  path="/loans/create"
                  label="Solicitar Préstamo"
                  variant="subitem"
                  isActive={isActive('/loans/create')}
                  onClick={() => setMenuOpen(false)}
                />
                <NavLink
                  path="/loans/history"
                  label="Historial de Préstamos"
                  variant="subitem"
                  isActive={isActive('/loans/history')}
                  onClick={() => setMenuOpen(false)}
                />
                {user?.role === 'administrator' && (
                  <NavLink
                    path="/loans/approval"
                    label="Aprobar Préstamos"
                    variant="subitem"
                    isActive={isActive('/loans/approval')}
                    onClick={() => setMenuOpen(false)}
                  />
                )}
                {(user?.role === 'administrator' || user?.role === 'technician') && (
                  <NavLink
                    path="/loans/reports"
                    label="Reporte Préstamos"
                    variant="subitem"
                    isActive={isActive('/loans/reports')}
                    onClick={() => setMenuOpen(false)}
                  />
                )}
              </div>
            )}
          </div>

          {/* Inventario: administrador siempre; resto solo si tiene equipo/herramienta asignados o consumible en solicitud aprobada */}
          {canSeeInventoryMenu && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setInventoryOpen(!inventoryOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  inventoryActive
                    ? 'bg-blue-500 text-white shadow-sm border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <EquipmentIcon
                    className={`flex-shrink-0 h-5 w-5 ${
                      inventoryActive ? 'text-white' : 'text-gray-600'
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
                    variant="subitem"
                    isActive={isActive('/equipment')}
                    onClick={() => setMenuOpen(false)}
                  />
                  <NavLink
                    path="/consumables"
                    label="Consumibles"
                    variant="subitem"
                    isActive={isActive('/consumables')}
                    onClick={() => setMenuOpen(false)}
                  />
                  <NavLink
                    path="/tools"
                    label="Herramientas"
                    variant="subitem"
                    isActive={isActive('/tools')}
                    onClick={() => setMenuOpen(false)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Grupo Estadísticas - Solo para técnicos y administradores */}
          {(user?.role === 'technician' || user?.role === 'administrator') && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setAnalyticsOpen(!analyticsOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  analyticsActive
                    ? 'bg-blue-500 text-white shadow-sm border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <AnalyticsIcon
                    className={`flex-shrink-0 h-5 w-5 ${
                      analyticsActive ? 'text-white' : 'text-gray-600'
                    }`}
                  />
                  <span>Estadísticas</span>
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
                    label="Estadísticas de Tickets"
                    variant="subitem"
                    isActive={isActive('/analytics')}
                    onClick={() => setMenuOpen(false)}
                  />
                  <NavLink
                    path="/equipment/analytics"
                    label="Estadísticas de Equipos"
                    variant="subitem"
                    isActive={isActive('/equipment/analytics')}
                    onClick={() => setMenuOpen(false)}
                  />
                  <NavLink
                    path="/consumables/analytics"
                    label="Estadísticas de Consumibles"
                    variant="subitem"
                    isActive={isActive('/consumables/analytics')}
                    onClick={() => setMenuOpen(false)}
                  />
                  <NavLink
                    path="/tools/analytics"
                    label="Estadísticas de Herramientas"
                    variant="subitem"
                    isActive={isActive('/tools/analytics')}
                    onClick={() => setMenuOpen(false)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Reportes */}
          {user?.role === 'administrator' && (
            <NavLink
              path="/admin/reports"
              label="Reportes"
              icon={ReportsIcon}
              isActive={isActive('/admin/reports')}
              onClick={() => setMenuOpen(false)}
            />
          )}

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
