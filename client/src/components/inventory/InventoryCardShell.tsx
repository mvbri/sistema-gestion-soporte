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
  /** `airy`: card minimalista para inventario de equipos */
  variant?: 'default' | 'airy';
}

export const inventoryPanelClass =
  'rounded-2xl border border-white/10 bg-[#12181f] p-4 sm:p-5';

export const inventoryCardClass =
  'rounded-2xl border border-white/10 bg-[#1f262e] p-5 transition-colors duration-150 hover:border-white/[0.14]';

const airyActionButton =
  'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/35 focus:ring-offset-0 focus:ring-offset-[#1f262e]';

export const InventoryCardShell: React.FC<InventoryCardShellProps> = ({
  title,
  badges,
  onView,
  onDelete,
  canEdit = false,
  canDelete = false,
  itemLabel = 'ítem',
  children,
  variant = 'default',
}) => {
  const isAiry = variant === 'airy';

  return (
    <article
      className={
        isAiry
          ? `flex flex-col h-full ${inventoryCardClass}`
          : 'card flex flex-col h-full !p-4 sm:!p-5 hover:ring-sky-400/40 transition-shadow duration-200'
      }
    >
      <header
        className={
          isAiry
            ? 'flex items-start justify-between gap-3 mb-0 pb-4 border-b border-white/10'
            : 'flex items-start justify-between gap-3 mb-4 pb-4 border-b border-sky-400/20'
        }
      >
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-white truncate tracking-tight">{title}</h3>
          {badges ? <div className="mt-2 flex flex-wrap gap-1.5">{badges}</div> : null}
        </div>
        <div className="flex shrink-0 gap-1">
          {canEdit && onView ? (
            <button
              type="button"
              onClick={onView}
              className={isAiry ? airyActionButton : viewButtonClass}
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
              className={
                isAiry
                  ? `${airyActionButton} hover:text-rose-200 hover:border-rose-400/25 hover:bg-rose-500/10`
                  : deleteButtonClass
              }
              title={`Eliminar ${itemLabel}`}
              aria-label={`Eliminar ${title}`}
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>
      </header>
      <div className={isAiry ? 'flex flex-col flex-1' : 'flex flex-col gap-2 flex-1'}>{children}</div>
    </article>
  );
};

export const InventoryCardAlert: React.FC<{
  label: string;
  value: React.ReactNode;
  variant?: 'rose' | 'amber' | 'soft';
}> = ({ label, value, variant = 'rose' }) => {
  if (variant === 'soft') {
    return (
      <div className="flex items-center justify-between gap-3 py-3 border-b border-white/10">
        <span className="inline-flex shrink-0 items-center rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-950">
          {label}
        </span>
        <span className="text-sm font-semibold text-white truncate text-right">{value}</span>
      </div>
    );
  }

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
