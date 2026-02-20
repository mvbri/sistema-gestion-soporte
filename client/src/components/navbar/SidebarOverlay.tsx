import React from 'react';

interface SidebarOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarOverlay: React.FC<SidebarOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 md:opacity-0' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    />
  );
};
