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
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="page-heading">Inventario de herramientas</h1>
                <p className="page-subheading">
                  Gestiona herramientas como destornilladores, cables, probadores de red y otros insumos de trabajo.
                </p>
              </div>
              {canCreate && (
                <button
                  type="button"
                  onClick={() => navigate('/tools/crear')}
                  className="btn-primary w-full sm:w-auto whitespace-nowrap"
                >
                  Crear herramienta
                </button>
              )}
            </header>

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
              <div className="card py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sky-400 border-t-transparent" />
                <p className="mt-3 text-blue-100/85">Cargando herramientas…</p>
              </div>
            ) : tools.length === 0 ? (
              <div className="card py-12 text-center px-4">
                <p className="text-blue-100/80">No se encontraron herramientas.</p>
                <p className="text-sm text-blue-100/60 mt-2">Intenta ajustar los filtros de búsqueda.</p>
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
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs sm:text-sm text-blue-50/90">
                      Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                      {pagination.total} herramientas
                    </div>
                    <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((prev: ToolFilters) => ({ ...prev, page: (prev.page || 1) - 1 }))
                      }
                      disabled={pagination.page === 1}
                      className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <span className="flex items-center px-2 text-xs sm:text-sm text-blue-100/75 tabular-nums">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((prev: ToolFilters) => ({ ...prev, page: (prev.page || 1) + 1 }))
                      }
                      disabled={pagination.page === pagination.totalPages}
                      className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                    </div>
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

