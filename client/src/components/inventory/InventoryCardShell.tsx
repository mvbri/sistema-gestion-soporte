import React from 'react';
import { Eye, Trash2 } from 'lucide-react';

const viewButtonClass =
  'inline-flex items-center justify-center rounded-lg p-2 text-sky-300 hover:bg-sky-500/20 hover:text-white border border-sky-400/30 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900';

const deleteButtonClass =
  'inline-flex items-center justify-center rounded-lg p-2 text-rose-300 hover:bg-rose-500/20 hover:text-white border border-rose-400/30 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-slate-900';

interface InventoryCardShellProps {
  title: string;
  badges?: React.ReactNode;
  onView?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  itemLabel?: string;
  children: React.ReactNode;
}

/** Contenedor común para cards de inventario en grid. */
export const InventoryCardShell: React.FC<InventoryCardShellProps> = ({
  title,
  badges,
  onView,
  onDelete,
  canEdit = false,
  canDelete = false,
  itemLabel = 'ítem',
  children,
}) => (
  <article className="card flex flex-col h-full !p-4 sm:!p-5 hover:ring-sky-400/40 transition-shadow duration-200">
    <header className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-sky-400/20">
      <div className="min-w-0 flex-1">
        <h3 className="text-base sm:text-lg font-semibold text-white truncate">{title}</h3>
        {badges ? <div className="mt-2 flex flex-wrap gap-1.5">{badges}</div> : null}
      </div>
      <div className="flex shrink-0 gap-1.5">
        {canEdit && onView ? (
          <button
            type="button"
            onClick={onView}
            className={viewButtonClass}
            title={`Ver ${itemLabel}`}
            aria-label={`Ver ${title}`}
          >
            <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        ) : null}
        {canDelete && onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className={deleteButtonClass}
            title={`Eliminar ${itemLabel}`}
            aria-label={`Eliminar ${title}`}
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        ) : null}
      </div>
    </header>
    <div className="flex flex-col gap-2 flex-1">{children}</div>
  </article>
);

/** Alerta destacada (préstamo activo, stock bajo, etc.). */
export const InventoryCardAlert: React.FC<{
  label: string;
  value: React.ReactNode;
  variant?: 'rose' | 'amber';
}> = ({ label, value, variant = 'rose' }) => {
  const isAmber = variant === 'amber';

  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ring-1 ring-inset border-l-4 flex items-center justify-between gap-3 ${
        isAmber
          ? 'border-amber-400/35 bg-amber-950/35 ring-amber-400/15 border-l-amber-400/90'
          : 'border-rose-400/35 bg-rose-950/35 ring-rose-400/15 border-l-rose-400/90'
      }`}
    >
      <span
        className={`text-xs font-semibold uppercase tracking-wide ${
          isAmber ? 'text-amber-200/90' : 'text-rose-200/90'
        }`}
      >
        {label}
      </span>
      <span className={`text-sm font-medium text-right truncate ${isAmber ? 'text-amber-50' : 'text-rose-50'}`}>
        {value}
      </span>
    </div>
  );
};
