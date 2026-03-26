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
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-3 truncate group-hover:text-blue-600 transition-colors">
            {tool.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            <ToolStatusBadge status={tool.status} />
            {tool.type_name && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                {tool.type_name}
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2 ml-4 flex-shrink-0">
          {canEdit && (
            <button
              onClick={() => navigate(`/tools/${tool.id}`)}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg border border-blue-200 hover:border-blue-600 transition-all duration-200"
            >
              Ver
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(tool.id, tool.name)}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 rounded-lg border border-red-200 hover:border-red-600 transition-all duration-200"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 relative z-10">
        {tool.code && (
          <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-sm font-medium text-gray-600">Código</span>
            <span className="text-xs font-mono font-semibold text-gray-900">{tool.code}</span>
          </div>
        )}
        {tool.location && (
          <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-sm font-medium text-gray-600">Ubicación</span>
            <span className="text-sm font-semibold text-gray-900">{tool.location}</span>
          </div>
        )}
        {tool.assigned_to_user_name && (
          <div className="flex justify-between items-center py-2 px-3 bg-blue-50 rounded-lg border border-blue-100">
            <span className="text-sm font-medium text-blue-700">Asignada a</span>
            <span className="text-sm font-semibold text-blue-900">{tool.assigned_to_user_name}</span>
          </div>
        )}
        {tool.condition && (
          <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-sm font-medium text-gray-600">Condición</span>
            <span className="text-sm font-semibold text-gray-900 capitalize">{tool.condition}</span>
          </div>
        )}
      </div>
    </div>
  );
};

