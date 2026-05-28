interface InventoryTypeBadgeProps {
  type: string;
  className?: string;
}

/** Badge de tipo/categoría en cards de inventario. */
export const InventoryTypeBadge: React.FC<InventoryTypeBadgeProps> = ({ type, className = '' }) => (
  <span
    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-950 ring-1 ring-inset ring-violet-300/60 ${className}`.trim()}
  >
    {type}
  </span>
);
