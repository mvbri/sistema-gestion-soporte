import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import {
  useConsumableById,
  useConsumableTypes,
  useConsumableStatuses,
  useUpdateConsumable,
} from '../hooks/useConsumables';
import { updateConsumableSchema, type UpdateConsumableData } from '../schemas/consumableSchemas';
import { ConsumableStatusBadge } from '../components/consumables/ConsumableStatusBadge';

export const ConsumableDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const consumableId = id ? parseInt(id, 10) : undefined;
  const { data: consumable, isLoading: loadingConsumable } = useConsumableById(consumableId);
  const { data: types = [] } = useConsumableTypes();
  const { data: statuses = [] } = useConsumableStatuses();

  const updateConsumableMutation = useUpdateConsumable();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<UpdateConsumableData>({
    resolver: zodResolver(updateConsumableSchema),
  });

  useEffect(() => {
    if (consumable) {
      reset({
        name: consumable.name,
        type_id: consumable.type_id,
        unit: consumable.unit,
        quantity: consumable.quantity,
        minimum_quantity: consumable.minimum_quantity,
        status: consumable.status,
        description: consumable.description,
      });
    }
  }, [consumable, reset]);

  const onSubmit = (data: UpdateConsumableData) => {
    if (!consumableId) return;
    updateConsumableMutation.mutate(
      { id: consumableId, data },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const canEdit = user?.role === 'administrator';

  if (loadingConsumable) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando consumible...</p>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  if (!consumable) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Consumible no encontrado</p>
            <button
              onClick={() => navigate('/consumables')}
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
                <h2 className="text-2xl font-bold text-gray-900">{consumable.name}</h2>
                <div className="flex space-x-2">
                  {canEdit && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Editar
                    </button>
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
                    onClick={() => navigate('/consumables')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Volver
                  </button>
                </div>
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <ConsumableStatusBadge status={consumable.status} />
                    {consumable.type_name && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {consumable.type_name}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">Unidad:</span>
                      <p className="text-gray-900">{consumable.unit}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Cantidad:</span>
                      <p className="text-gray-900">
                        {consumable.quantity} {consumable.unit}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Cantidad mínima:</span>
                      <p className="text-gray-900">
                        {consumable.minimum_quantity} {consumable.unit}
                      </p>
                    </div>
                  </div>

                  {consumable.description && (
                    <div>
                      <span className="font-medium text-gray-700">Descripción:</span>
                      <p className="text-gray-900 mt-1">{consumable.description}</p>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                      <Controller
                        name="type_id"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unidad</label>
                    <input
                      type="text"
                      {...register('unit')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                      <input
                        type="number"
                        min={0}
                        {...register('quantity', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      {errors.quantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad mínima</label>
                      <input
                        type="number"
                        min={0}
                        {...register('minimum_quantity', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      {errors.minimum_quantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.minimum_quantity.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updateConsumableMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updateConsumableMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};

