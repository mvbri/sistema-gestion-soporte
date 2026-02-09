import type { CategoriaTicket } from '../../types';

interface CategoryBadgeProps {
  categoria: CategoriaTicket | string;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ categoria, className = '' }) => {
  const categoriaNombre = typeof categoria === 'string' ? categoria : categoria.nombre;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}
    >
      {categoriaNombre}
    </span>
  );
};
