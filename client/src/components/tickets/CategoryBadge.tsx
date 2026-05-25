import type { CategoriaTicket } from '../../types';

interface CategoryBadgeProps {
  categoria: CategoriaTicket | string;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ categoria, className = '' }) => {
  const categoriaNombre = typeof categoria === 'string' ? categoria : categoria.name;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-900 ring-1 ring-inset ring-sky-300/60 shadow-sm ${className}`}
    >
      {categoriaNombre}
    </span>
  );
};
