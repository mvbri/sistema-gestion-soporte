import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import {
  useEquipment,
  useEquipmentTypes,
  useEquipmentStatuses,
  useDeleteEquipment,
  useTecnicos
} from '../hooks/useEquipment';
import type { Equipment, EquipmentFilters } from '../types';
import { EquipmentCard } from '../components/equipment/EquipmentCard';
import { EquipmentFilters as EquipmentFiltersComponent } from '../components/equipment/EquipmentFilters';
import { ConfirmDeleteEquipmentModal } from '../components/equipment/ConfirmDeleteEquipmentModal';

export const EquipmentList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initialFilters: EquipmentFilters = {
    page: 1,
    limit: 10,
  };
  const [filters, setFilters] = useState<EquipmentFilters>(initialFilters);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; equipmentId: number | null; equipmentName: string }>({
    isOpen: false,
    equipmentId: null,
    equipmentName: '',
  });
  const [showMyAssigned, setShowMyAssigned] = useState(false);

  const { data: equipmentData, isLoading: loadingEquipment } = useEquipment(filters);
  const { data: types = [] } = useEquipmentTypes();
  const { data: statuses = [] } = useEquipmentStatuses();
  const { data: tecnicos = [] } = useTecnicos();
  const deleteEquipmentMutation = useDeleteEquipment();

  const equipment = equipmentData?.equipment || [];
  const pagination = equipmentData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  const handleFilterChange = (key: keyof EquipmentFilters, value: string | number | boolean | undefined) => {
    setFilters((prev: EquipmentFilters) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = () => {
    setFilters((prev: EquipmentFilters) => ({ ...prev, search: searchTerm || undefined, page: 1 }));
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

      setFilters((prevFilters: EquipmentFilters) => {
        if (next) {
          return {
            ...prevFilters,
            status: 'assigned',
            assigned_to_user_id: user.id,
            page: 1,
          };
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    setDeleteModal({ isOpen: true, equipmentId: id, equipmentName: name });
  };

  const confirmDelete = () => {
    if (deleteModal.equipmentId) {
      deleteEquipmentMutation.mutate(deleteModal.equipmentId, {
        onSuccess: () => {
          setDeleteModal({ isOpen: false, equipmentId: null, equipmentName: '' });
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
                <h1 className="text-3xl font-bold text-gray-900">Inventario de Equipos</h1>
                {user?.role === 'end_user' && (
                  <p className="mt-1 text-sm text-gray-600">Solo puedes ver equipos disponibles</p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {isAdministrator && (
                  <button
                    type="button"
                    onClick={handleToggleMyAssigned}
                    className={`px-4 py-2 rounded-md text-sm font-medium border ${
                      showMyAssigned
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {showMyAssigned ? 'Ver todo el inventario' : 'Mis equipos asignados'}
                  </button>
                )}
                {canCreate && (
                  <button
                    onClick={() => navigate('/equipment/crear')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Crear Equipo
                  </button>
                )}
              </div>
            </div>

            {(canEdit || canDelete) && (
              <EquipmentFiltersComponent
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

            {loadingEquipment ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Cargando equipos...</p>
                </div>
              </div>
            ) : equipment.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No se encontraron equipos</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {equipment.map((item: Equipment) => (
                    <EquipmentCard
                      key={item.id}
                      equipment={item}
                      onDelete={canDelete ? handleDelete : undefined}
                      canEdit={canEdit}
                      canDelete={canDelete}
                    />
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => setFilters((prev: EquipmentFilters) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters((prev: EquipmentFilters) => ({ ...prev, page: (prev.page || 1) + 1 }))}
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

      <ConfirmDeleteEquipmentModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, equipmentId: null, equipmentName: '' })}
        onConfirm={confirmDelete}
        equipmentName={deleteModal.equipmentName}
      />
    </>
  );
};
