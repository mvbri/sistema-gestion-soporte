import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCreateConsumable, useConsumableTypes } from '../hooks/useConsumables';
import { createConsumableSchema, type CreateConsumableData } from '../schemas/consumableSchemas';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';

export const CreateConsumable: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: types = [] } = useConsumableTypes();
  const createConsumableMutation = useCreateConsumable();

  useEffect(() => {
    if (user && user.role !== 'administrator') {
      navigate('/consumables');
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateConsumableData>({
    resolver: zodResolver(createConsumableSchema),
  });

  const onSubmit = (data: CreateConsumableData) => {
    createConsumableMutation.mutate(data, {
      onSuccess: () => {
        navigate('/consumables');
      },
    });
  };

  if (user && user.role !== 'administrator') {
    return null;
  }

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Consumible</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Consumible <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('type_id', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccione un tipo</option>
                      {types.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.type_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.type_id.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unidad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('unit')}
                      placeholder="ej. unidades, cajas, resmas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.unit && (
                      <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                    <input
                      type="number"
                      min={0}
                      {...register('quantity', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad Mínima</label>
                    <input
                      type="number"
                      min={0}
                      {...register('minimum_quantity', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/consumables')}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createConsumableMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createConsumableMutation.isPending ? 'Creando...' : 'Crear Consumible'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};

