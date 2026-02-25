interface TypeBadgeProps {
  type: string;
  className?: string;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 ${className}`}
    >
      {type}
    </span>
  );
};
