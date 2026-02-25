import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Equipment } from '../../types';
import { StatusBadge } from './StatusBadge';
import { TypeBadge } from './TypeBadge';

interface EquipmentCardProps {
  equipment: Equipment;
  onDelete?: (id: number, name: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  onDelete,
  canEdit = false,
  canDelete = false,
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{equipment.name}</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <StatusBadge status={equipment.status} />
            {equipment.type_name && <TypeBadge type={equipment.type_name} />}
          </div>
        </div>
        <div className="flex space-x-2">
          {canEdit && (
            <button
              onClick={() => navigate(`/equipment/${equipment.id}`)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ver
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(equipment.id, equipment.name)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        {equipment.brand && (
          <div>
            <span className="font-medium">Marca:</span> {equipment.brand}
          </div>
        )}
        {equipment.model && (
          <div>
            <span className="font-medium">Modelo:</span> {equipment.model}
          </div>
        )}
        {equipment.serial_number && (
          <div>
            <span className="font-medium">Número de Serie:</span> {equipment.serial_number}
          </div>
        )}
        {equipment.location && (
          <div>
            <span className="font-medium">Ubicación:</span> {equipment.location}
          </div>
        )}
        {equipment.assigned_to_user_name && (
          <div>
            <span className="font-medium">Asignado a:</span> {equipment.assigned_to_user_name}
          </div>
        )}
        {equipment.purchase_date && (
          <div>
            <span className="font-medium">Fecha de Compra:</span> {formatDate(equipment.purchase_date)}
          </div>
        )}
      </div>
    </div>
  );
};
