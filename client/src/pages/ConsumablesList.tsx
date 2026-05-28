import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import {
  useConsumables,
  useConsumableTypes,
  useConsumableStatuses,
  useDeleteConsumable,
} from '../hooks/useConsumables';
import type { Consumable, ConsumableFilters } from '../types';
import { ConsumableCard } from '../components/consumables/ConsumableCard';
import { ConsumableFilters as ConsumableFiltersComponent } from '../components/consumables/ConsumableFilters';
import { ConfirmDeleteConsumableModal } from '../components/consumables/ConfirmDeleteConsumableModal';

export const ConsumablesList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initialFilters: ConsumableFilters = {
    page: 1,
    limit: 10,
  };
  const [filters, setFilters] = useState<ConsumableFilters>(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; consumableId: number | null; consumableName: string }>({
    isOpen: false,
    consumableId: null,
    consumableName: '',
  });

  const { data: consumablesData, isLoading: loadingConsumables } = useConsumables(filters);
  const { data: types = [] } = useConsumableTypes();
  const { data: statuses = [] } = useConsumableStatuses();
  const deleteConsumableMutation = useDeleteConsumable();

  const consumables = consumablesData?.consumables || [];
  const pagination = consumablesData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  const handleFilterChange = (key: keyof ConsumableFilters, value: any) => {
    setFilters((prev: ConsumableFilters) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = () => {
    setFilters((prev: ConsumableFilters) => ({ ...prev, search: searchTerm || undefined, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters(initialFilters);
  };

  const handleDelete = (id: number, name: string) => {
    setDeleteModal({ isOpen: true, consumableId: id, consumableName: name });
  };

  const confirmDelete = () => {
    if (deleteModal.consumableId) {
      deleteConsumableMutation.mutate(deleteModal.consumableId, {
        onSuccess: () => {
          setDeleteModal({ isOpen: false, consumableId: null, consumableName: '' });
        },
      });
    }
  };

  const isAdministrator = user?.role === 'administrator';
  const canEdit = isAdministrator;
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
                <h1 className="page-heading">Inventario de consumibles</h1>
                <p className="page-subheading">
                  Gestiona consumibles como papel, lápices, tóner y otros materiales de oficina.
                </p>
              </div>
              {canCreate && (
                <button
                  type="button"
                  onClick={() => navigate('/consumables/crear')}
                  className="btn-primary w-full sm:w-auto whitespace-nowrap"
                >
                  Crear consumible
                </button>
              )}
            </header>

            {canEdit || canDelete ? (
              <ConsumableFiltersComponent
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onClearFilters={handleClearFilters}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                types={types}
                statuses={statuses}
              />
            ) : null}

            {loadingConsumables ? (
              <div className="card py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sky-400 border-t-transparent" />
                <p className="mt-3 text-blue-100/85">Cargando consumibles…</p>
              </div>
            ) : consumables.length === 0 ? (
              <div className="card py-12 text-center px-4">
                <p className="text-blue-100/80">No se encontraron consumibles.</p>
                <p className="text-sm text-blue-100/60 mt-2">Intenta ajustar los filtros de búsqueda.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {consumables.map((item: Consumable) => (
                    <ConsumableCard
                      key={item.id}
                      consumable={item}
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
                      {pagination.total} consumibles
                    </div>
                    <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((prev: ConsumableFilters) => ({ ...prev, page: (prev.page || 1) - 1 }))
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
                        setFilters((prev: ConsumableFilters) => ({ ...prev, page: (prev.page || 1) + 1 }))
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

      <ConfirmDeleteConsumableModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, consumableId: null, consumableName: '' })}
        onConfirm={confirmDelete}
        consumableName={deleteModal.consumableName}
      />
    </>
  );
};

