import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import {
  useEquipmentById,
  useEquipmentTypes,
  useEquipmentStatuses,
  useUpdateEquipment,
  useAssignEquipment,
  useUnassignEquipment,
} from '../hooks/useEquipment';
import { useTecnicos } from '../hooks/useTickets';
import { updateEquipmentSchema, type UpdateEquipmentData, type AssignEquipmentData } from '../schemas/equipmentSchemas';
import { StatusBadge } from '../components/equipment/StatusBadge';
import { TypeBadge } from '../components/equipment/TypeBadge';
import { AssignEquipmentModal } from '../components/equipment/AssignEquipmentModal';
import { ConfirmUnassignModal } from '../components/equipment/ConfirmUnassignModal';

export const EquipmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [hasWarranty, setHasWarranty] = useState(false);

  const equipmentId = id ? parseInt(id) : undefined;
  const { data: equipment, isLoading: loadingEquipment } = useEquipmentById(equipmentId);
  const { data: types = [] } = useEquipmentTypes();
  const { data: statuses = [] } = useEquipmentStatuses();
  const { data: tecnicos = [] } = useTecnicos();

  const updateEquipmentMutation = useUpdateEquipment();
  const assignEquipmentMutation = useAssignEquipment();
  const unassignEquipmentMutation = useUnassignEquipment();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm<UpdateEquipmentData>({
    resolver: zodResolver(updateEquipmentSchema),
  });

  useEffect(() => {
    if (equipment) {
      const hasWarrantyValue = !!equipment.warranty_expires_at;
      setHasWarranty(hasWarrantyValue);
      reset({
        name: equipment.name,
        brand: equipment.brand,
        model: equipment.model,
        serial_number: equipment.serial_number,
        type_id: equipment.type_id,
        status: equipment.status,
        location: equipment.location,
        assigned_to_user_id: equipment.assigned_to_user_id,
        description: equipment.description,
        purchase_date: equipment.purchase_date,
        warranty_expires_at: equipment.warranty_expires_at,
      });
    }
  }, [equipment, reset]);

  const onSubmit = (data: UpdateEquipmentData) => {
    if (!equipmentId) return;
    updateEquipmentMutation.mutate(
      { id: equipmentId, data },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleAssign = (data: AssignEquipmentData) => {
    if (!equipmentId) return;
    assignEquipmentMutation.mutate(
      { id: equipmentId, data },
      {
        onSuccess: () => {
          setShowAssignModal(false);
        },
      }
    );
  };

  const handleUnassign = () => {
    setShowUnassignModal(true);
  };

  const confirmUnassign = () => {
    if (!equipmentId) return;
    unassignEquipmentMutation.mutate(equipmentId, {
      onSuccess: () => {
        setShowUnassignModal(false);
      },
    });
  };

  const canEdit = user?.role === 'administrator';

  if (loadingEquipment) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando equipo...</p>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  if (!equipment) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Equipo no encontrado</p>
            <button
              onClick={() => navigate('/equipment')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Volver a la lista
            </button>
          </div>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{equipment.name}</h2>
                <div className="flex space-x-2">
                  {canEdit && !isEditing && (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Editar
                      </button>
                      {equipment.status === 'assigned' && equipment.assigned_to_user_id && (
                        <button
                          onClick={handleUnassign}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                        >
                          Desasignar
                        </button>
                      )}
                      {equipment.status !== 'assigned' && (
                        <button
                          onClick={() => setShowAssignModal(true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Asignar
                        </button>
                      )}
                    </>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        reset();
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/equipment')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Volver
                  </button>
                </div>
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <StatusBadge status={equipment.status} />
                    {equipment.type_name && <TypeBadge type={equipment.type_name} />}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {equipment.brand && (
                      <div>
                        <span className="font-medium text-gray-700">Marca:</span>
                        <p className="text-gray-900">{equipment.brand}</p>
                      </div>
                    )}
                    {equipment.model && (
                      <div>
                        <span className="font-medium text-gray-700">Modelo:</span>
                        <p className="text-gray-900">{equipment.model}</p>
                      </div>
                    )}
                    {equipment.serial_number && (
                      <div>
                        <span className="font-medium text-gray-700">Número de Serie:</span>
                        <p className="text-gray-900">{equipment.serial_number}</p>
                      </div>
                    )}
                    {equipment.location && (
                      <div>
                        <span className="font-medium text-gray-700">Ubicación:</span>
                        <p className="text-gray-900">{equipment.location}</p>
                      </div>
                    )}
                    {equipment.assigned_to_user_name && (
                      <div>
                        <span className="font-medium text-gray-700">Asignado a:</span>
                        <p className="text-gray-900">{equipment.assigned_to_user_name}</p>
                      </div>
                    )}
                    {equipment.purchase_date && (
                      <div>
                        <span className="font-medium text-gray-700">Fecha de Compra:</span>
                        <p className="text-gray-900">
                          {new Date(equipment.purchase_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}
                    {equipment.warranty_expires_at && (
                      <div>
                        <span className="font-medium text-gray-700">Garantía Expira:</span>
                        <p className="text-gray-900">
                          {new Date(equipment.warranty_expires_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}
                  </div>

                  {equipment.description && (
                    <div>
                      <span className="font-medium text-gray-700">Descripción:</span>
                      <p className="text-gray-900 mt-1">{equipment.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input
                      type="text"
                      {...register('name')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                      <input type="text" {...register('brand')} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                      <input type="text" {...register('model')} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de Serie</label>
                    <input type="text" {...register('serial_number')} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                      <Controller
                        name="type_id"
                        control={control}
                        render={({ field }) => (
                          <select 
                            {...field} 
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Seleccione un tipo</option>
                            {types.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <select {...field} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                            {statuses.map((status) => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                    <input type="text" {...register('location')} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Compra</label>
                      <input type="date" {...register('purchase_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id="hasWarranty"
                          checked={hasWarranty}
                          onChange={(e) => {
                            setHasWarranty(e.target.checked);
                            if (!e.target.checked) {
                              setValue('warranty_expires_at', '');
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="hasWarranty" className="ml-2 block text-sm font-medium text-gray-700">
                          Si aplica
                        </label>
                      </div>
                      {hasWarranty && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Garantía Expira</label>
                          <input type="date" {...register('warranty_expires_at')} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea {...register('description')} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updateEquipmentMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updateEquipmentMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </PageWrapper>

      <AssignEquipmentModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssign}
        users={tecnicos}
        equipmentName={equipment.name}
        isLoading={assignEquipmentMutation.isPending}
      />

      <ConfirmUnassignModal
        isOpen={showUnassignModal}
        onClose={() => setShowUnassignModal(false)}
        onConfirm={confirmUnassign}
        equipmentName={equipment.name}
      />
    </>
  );
};
