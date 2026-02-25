import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import {
  useTools,
  useToolTypes,
  useToolStatuses,
  useDeleteTool,
  useTecnicos,
} from '../hooks/useTools';
import type { Tool, ToolFilters } from '../types';
import { ToolCard } from '../components/tools/ToolCard';
import { ToolFilters as ToolFiltersComponent } from '../components/tools/ToolFilters';
import { ConfirmDeleteToolModal } from '../components/tools/ConfirmDeleteToolModal';

export const ToolsList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initialFilters: ToolFilters = {
    page: 1,
    limit: 10,
  };
  const [filters, setFilters] = useState<ToolFilters>(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; toolId: number | null; toolName: string }>({
    isOpen: false,
    toolId: null,
    toolName: '',
  });
  const [showMyAssigned, setShowMyAssigned] = useState(false);

  const { data: toolsData, isLoading: loadingTools } = useTools(filters);
  const { data: types = [] } = useToolTypes();
  const { data: statuses = [] } = useToolStatuses();
  const { data: tecnicos = [] } = useTecnicos();
  const deleteToolMutation = useDeleteTool();

  const tools = toolsData?.tools || [];
  const pagination = toolsData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  const handleFilterChange = (key: keyof ToolFilters, value: any) => {
    setFilters((prev: ToolFilters) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = () => {
    setFilters((prev: ToolFilters) => ({ ...prev, search: searchTerm || undefined, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters(initialFilters);
    setShowMyAssigned(false);
  };

  const handleToggleMyAssigned = () => {
    if (!user?.id) {
      return;
    }

    setShowMyAssigned((prev) => {
      const next = !prev;

      setFilters((prevFilters: ToolFilters) => {
        if (next) {
          return {
            ...prevFilters,
            status: 'assigned',
            assigned_to_user_id: user.id,
            page: 1,
          };
        }

        const { assigned_to_user_id, status, ...rest } = prevFilters;
        return {
          ...rest,
          page: 1,
        };
      });

      return next;
    });
  };

  const handleDelete = (id: number, name: string) => {
    setDeleteModal({ isOpen: true, toolId: id, toolName: name });
  };

  const confirmDelete = () => {
    if (deleteModal.toolId) {
      deleteToolMutation.mutate(deleteModal.toolId, {
        onSuccess: () => {
          setDeleteModal({ isOpen: false, toolId: null, toolName: '' });
        },
      });
    }
  };

  const isAdministrator = user?.role === 'administrator';
  const isTechnician = user?.role === 'technician';
  const canEdit = isAdministrator || isTechnician;
  const canDelete = isAdministrator;
  const canCreate = isAdministrator;

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventario de Herramientas</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Gestiona herramientas como destornilladores, cables, probadores de red y otros insumos de trabajo.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {(isAdministrator || isTechnician) && (
                  <button
                    type="button"
                    onClick={handleToggleMyAssigned}
                    className={`px-4 py-2 rounded-md text-sm font-medium border ${
                      showMyAssigned
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {showMyAssigned ? 'Ver todas las herramientas' : 'Mis herramientas asignadas'}
                  </button>
                )}
                {canCreate && (
                  <button
                    onClick={() => navigate('/tools/crear')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Crear Herramienta
                  </button>
                )}
              </div>
            </div>

            {(canEdit || canDelete) && (
              <ToolFiltersComponent
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onClearFilters={handleClearFilters}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                types={types}
                statuses={statuses}
                users={tecnicos}
              />
            )}

            {loadingTools ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Cargando herramientas...</p>
                </div>
              </div>
            ) : tools.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron herramientas</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {tools.map((item: Tool) => (
                    <ToolCard
                      key={item.id}
                      tool={item}
                      onDelete={canDelete ? handleDelete : undefined}
                      canEdit={canEdit}
                      canDelete={canDelete}
                    />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() =>
                        setFilters((prev: ToolFilters) => ({ ...prev, page: (prev.page || 1) - 1 }))
                      }
                      disabled={pagination.page === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <span className="px-4 py-2 text-gray-700">
                      Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setFilters((prev: ToolFilters) => ({ ...prev, page: (prev.page || 1) + 1 }))
                      }
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </PageWrapper>

      <ConfirmDeleteToolModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, toolId: null, toolName: '' })}
        onConfirm={confirmDelete}
        toolName={deleteModal.toolName}
      />
    </>
  );
};

