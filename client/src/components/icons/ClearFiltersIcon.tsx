import React from 'react';

/**
 * Icono estándar de “Limpiar filtros” (cruz / cerrar) — mismo trazo que TicketsList,
 * TechnicianDashboard, filtros de equipos, consumibles, herramientas y respaldos.
 */
interface ClearFiltersIconProps {
  className?: string;
}

export const ClearFiltersIcon: React.FC<ClearFiltersIconProps> = ({ className = 'h-4 w-4' }) => {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
};
