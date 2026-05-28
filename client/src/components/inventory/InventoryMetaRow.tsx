import React from 'react';

interface InventoryMetaRowProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  valueClassName?: string;
  variant?: 'default' | 'minimal';
}

export const InventoryMetaRow: React.FC<InventoryMetaRowProps> = ({
  label,
  value,
  mono,
  valueClassName = '',
  variant = 'default',
}) => {
  if (variant === 'minimal') {
    return (
      <div className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0 border-b border-white/10 last:border-0">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#8a94a6] shrink-0">
          {label}
        </span>
        <span
          className={`text-sm font-semibold text-white text-right break-words min-w-0 leading-snug ${
            mono ? 'font-mono text-xs font-medium' : ''
          } ${valueClassName}`.trim()}
        >
          {value}
        </span>
      </div>
    );
  }

  return (
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
};
