import React from 'react';
import type { Consumable } from '../../types';
import { ConsumableStatusBadge } from './ConsumableStatusBadge';

interface ConsumableCardProps {
  consumable: Consumable;
  onDelete?: (id: number, name: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const ConsumableCard: React.FC<ConsumableCardProps> = ({
  consumable,
  onDelete,
  canEdit = false,
  canDelete = false,
}) => {
  const getQuantityColor = () => {
    if (consumable.status === 'out_of_stock') return 'text-red-600';
    if (consumable.status === 'low_stock') return 'text-yellow-600';
    return 'text-gray-900';
  };

  const isBelowMinimum = consumable.quantity <= consumable.minimum_quantity;

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-3 truncate group-hover:text-blue-600 transition-colors">
            {consumable.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            <ConsumableStatusBadge status={consumable.status} />
            {consumable.type_name && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                {consumable.type_name}
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2 ml-4 flex-shrink-0">
          {canEdit && (
            <a
              href={`/consumables/${consumable.id}`}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg border border-blue-200 hover:border-blue-600 transition-all duration-200"
            >
              Ver
            </a>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(consumable.id, consumable.name)}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 rounded-lg border border-red-200 hover:border-red-600 transition-all duration-200"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-sm font-medium text-gray-600">Cantidad</span>
          <span className={`text-base font-bold ${getQuantityColor()}`}>
            {consumable.quantity} <span className="text-sm font-normal text-gray-500">{consumable.unit}</span>
          </span>
        </div>
        {isBelowMinimum && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs font-medium text-red-700">
              Bajo mínimo ({consumable.minimum_quantity} {consumable.unit})
            </span>
          </div>
        )}
        {consumable.description && (
          <div className="text-sm text-gray-600 leading-relaxed pt-2 border-t border-gray-100">
            {consumable.description}
          </div>
        )}
      </div>
    </div>
  );
};

