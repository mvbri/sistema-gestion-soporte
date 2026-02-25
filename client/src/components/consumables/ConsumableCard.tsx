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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{consumable.name}</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <ConsumableStatusBadge status={consumable.status} />
            {consumable.type_name && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {consumable.type_name}
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {canEdit && (
            <a
              href={`/consumables/${consumable.id}`}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ver
            </a>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(consumable.id, consumable.name)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div>
          <span className="font-medium">Cantidad:</span>{' '}
          <span className={getQuantityColor()}>
            {consumable.quantity} {consumable.unit}
          </span>
          {isBelowMinimum && (
            <span className="ml-2 inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
              Bajo mínimo ({consumable.minimum_quantity})
            </span>
          )}
        </div>
        {consumable.description && (
          <div>
            <span className="font-medium">Descripción:</span> {consumable.description}
          </div>
        )}
      </div>
    </div>
  );
};

