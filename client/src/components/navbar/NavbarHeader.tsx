import React from 'react';
import { Link } from 'react-router-dom';
import { MenuToggleButton } from './MenuToggleButton';

interface NavbarHeaderProps {
  menuOpen: boolean;
  onToggleMenu: () => void;
}

export const NavbarHeader: React.FC<NavbarHeaderProps> = ({
  menuOpen,
  onToggleMenu,
}) => {
  return (
    <div
      className={`flex items-center space-x-4 transition-opacity duration-300 ${
        menuOpen ? 'md:opacity-0 md:pointer-events-none' : 'opacity-100'
      }`}
    >
      <MenuToggleButton
        isOpen={menuOpen}
        onClick={onToggleMenu}
        ariaLabel="Menú principal"
      />
      <Link
        to="/dashboard"
        className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
      >
        Gestión de Soporte Técnico
      </Link>
    </div>
  );
};
