import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Tool } from '../../types';
import { ToolStatusBadge } from './ToolStatusBadge';

interface ToolCardProps {
  tool: Tool;
  onDelete?: (id: number, name: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  onDelete,
  canEdit = false,
  canDelete = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <ToolStatusBadge status={tool.status} />
            {tool.type_name && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                {tool.type_name}
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {canEdit && (
            <button
              onClick={() => navigate(`/tools/${tool.id}`)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ver
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(tool.id, tool.name)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        {tool.code && (
          <div>
            <span className="font-medium">Código:</span> {tool.code}
          </div>
        )}
        {tool.location && (
          <div>
            <span className="font-medium">Ubicación:</span> {tool.location}
          </div>
        )}
        {tool.assigned_to_user_name && (
          <div>
            <span className="font-medium">Asignada a:</span> {tool.assigned_to_user_name}
          </div>
        )}
        {tool.condition && (
          <div>
            <span className="font-medium">Condición:</span> {tool.condition}
          </div>
        )}
      </div>
    </div>
  );
};

