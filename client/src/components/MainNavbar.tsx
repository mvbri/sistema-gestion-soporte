import React from 'react';
import { useMenu } from '../contexts/MenuContext';
import { NavbarHeader } from './navbar/NavbarHeader';
import { UserMenu } from './navbar/UserMenu';
import { SidebarOverlay } from './navbar/SidebarOverlay';
import { SidebarMenu } from './navbar/SidebarMenu';

export const MainNavbar: React.FC = () => {
  const { menuOpen, setMenuOpen } = useMenu();

  return (
    <>
      <nav className="shadow-sm border-b border-blue-400/30 fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: '#5B7FA8' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <NavbarHeader
              menuOpen={menuOpen}
              onToggleMenu={() => setMenuOpen(!menuOpen)}
            />
            <div className="flex-shrink-0">
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>
      <SidebarOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <SidebarMenu />
    </>
  );
};
