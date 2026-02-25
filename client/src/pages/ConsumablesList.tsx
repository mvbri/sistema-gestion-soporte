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

  const handleFilterChange = (key: keyof ConsumableFilters, value: string | number | boolean | undefined) => {
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
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventario de Consumibles</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Gestiona consumibles como papel, lápices, tóner y otros materiales de oficina.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {canCreate && (
                  <button
                    onClick={() => navigate('/consumables/crear')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Crear Consumible
                  </button>
                )}
              </div>
            </div>

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
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Cargando consumibles...</p>
                </div>
              </div>
            ) : consumables.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron consumibles</p>
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
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() =>
                        setFilters((prev: ConsumableFilters) => ({ ...prev, page: (prev.page || 1) - 1 }))
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
                        setFilters((prev: ConsumableFilters) => ({ ...prev, page: (prev.page || 1) + 1 }))
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

      <ConfirmDeleteConsumableModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, consumableId: null, consumableName: '' })}
        onConfirm={confirmDelete}
        consumableName={deleteModal.consumableName}
      />
    </>
  );
};

