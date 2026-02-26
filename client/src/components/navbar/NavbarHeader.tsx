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
        className="flex items-center space-x-3 text-xl font-bold text-white hover:text-blue-100 transition-colors"
      >
        <img
          src="/alcado.webp"
          alt="Logo Alcaldía"
          className="h-10 w-auto object-contain"
        />
        <span>Gestión de Soporte Técnico</span>
      </Link>
    </div>
  );
};
