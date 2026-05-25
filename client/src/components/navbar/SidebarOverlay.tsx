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
      className={`fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 transition-opacity duration-300 ${
        isOpen ? 'opacity-100 md:opacity-0' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    />
  );
};
