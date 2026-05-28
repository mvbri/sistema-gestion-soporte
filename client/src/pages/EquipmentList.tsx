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

  const handleFilterChange = (key: keyof EquipmentFilters, value: any) => {
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
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="page-heading">Inventario de equipos</h1>
                {user?.role === 'end_user' ? (
                  <p className="page-subheading">Solo puedes ver equipos disponibles.</p>
                ) : (
                  <p className="page-subheading">Consulta, filtra y gestiona el inventario.</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                {isAdministrator && (
                  <button
                    type="button"
                    onClick={handleToggleMyAssigned}
                    className="btn-secondary w-full sm:w-auto whitespace-nowrap"
                  >
                    {showMyAssigned ? 'Ver todo el inventario' : 'Mis equipos asignados'}
                  </button>
                )}
                {canCreate && (
                  <button
                    type="button"
                    onClick={() => navigate('/equipment/crear')}
                    className="btn-primary w-full sm:w-auto whitespace-nowrap"
                  >
                    Crear equipo
                  </button>
                )}
              </div>
            </header>

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
              <div className="card py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sky-400 border-t-transparent" />
                <p className="mt-3 text-blue-100/85">Cargando equipos…</p>
              </div>
            ) : equipment.length === 0 ? (
              <div className="card py-12 text-center px-4">
                <p className="text-blue-100/80">No se encontraron equipos.</p>
                <p className="text-sm text-blue-100/60 mt-2">
                  Intenta ajustar los filtros de búsqueda.
                </p>
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
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs sm:text-sm text-blue-50/90">
                      Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                      {pagination.total} equipos
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFilters((prev: EquipmentFilters) => ({
                            ...prev,
                            page: Math.max((prev.page || 1) - 1, 1),
                          }))
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
                          setFilters((prev: EquipmentFilters) => ({
                            ...prev,
                            page: (prev.page || 1) + 1,
                          }))
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

      <ConfirmDeleteEquipmentModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, equipmentId: null, equipmentName: '' })}
        onConfirm={confirmDelete}
        equipmentName={deleteModal.equipmentName}
      />
    </>
  );
};
