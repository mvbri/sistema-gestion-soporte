import React from 'react';

interface InventoryMetaRowProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  valueClassName?: string;
}

/** Fila etiqueta/valor para cards de inventario (equipos, herramientas, consumibles). */
export const InventoryMetaRow: React.FC<InventoryMetaRowProps> = ({
  label,
  value,
  mono,
  valueClassName = '',
}) => (
  <div className="info-tile flex items-start justify-between gap-3 !py-2.5 sm:!py-3">
    <span className="text-xs font-medium uppercase tracking-wide text-blue-100/60 shrink-0">
      {label}
    </span>
    <span
      className={`text-sm font-medium text-blue-50 text-right break-words min-w-0 ${
        mono ? 'font-mono text-xs sm:text-sm' : ''
      } ${valueClassName}`.trim()}
    >
      {value}
    </span>
  </div>
);
