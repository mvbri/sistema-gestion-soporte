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
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-3 truncate group-hover:text-blue-600 transition-colors">
            {equipment.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={equipment.status} />
            {equipment.type_name && <TypeBadge type={equipment.type_name} />}
          </div>
        </div>
        <div className="flex space-x-2 ml-4 flex-shrink-0">
          {canEdit && (
            <button
              onClick={() => navigate(`/equipment/${equipment.id}`)}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg border border-blue-200 hover:border-blue-600 transition-all duration-200"
            >
              Ver
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(equipment.id, equipment.name)}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 rounded-lg border border-red-200 hover:border-red-600 transition-all duration-200"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        {equipment.brand && (
          <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-sm font-medium text-gray-600">Marca</span>
            <span className="text-sm font-semibold text-gray-900">{equipment.brand}</span>
          </div>
        )}
        {equipment.model && (
          <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-sm font-medium text-gray-600">Modelo</span>
            <span className="text-sm font-semibold text-gray-900">{equipment.model}</span>
          </div>
        )}
        {equipment.serial_number && (
          <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-sm font-medium text-gray-600">Número de Serie</span>
            <span className="text-xs font-mono font-semibold text-gray-900">{equipment.serial_number}</span>
          </div>
        )}
        {equipment.location && (
          <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-sm font-medium text-gray-600">Ubicación</span>
            <span className="text-sm font-semibold text-gray-900">{equipment.location}</span>
          </div>
        )}
        {equipment.assigned_to_user_name && (
          <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg border border-blue-100">
            <span className="text-sm font-medium text-blue-700">Asignado a</span>
            <span className="text-sm font-semibold text-blue-900">{equipment.assigned_to_user_name}</span>
          </div>
        )}
        {equipment.purchase_date && (
          <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-sm font-medium text-gray-600">Fecha de Compra</span>
            <span className="text-sm font-semibold text-gray-900">{formatDate(equipment.purchase_date)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
