import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCreateEquipment, useEquipmentTypes } from '../hooks/useEquipment';
import { createEquipmentSchema, type CreateEquipmentData } from '../schemas/equipmentSchemas';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';

export const CreateEquipment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: types = [] } = useEquipmentTypes();
  const createEquipmentMutation = useCreateEquipment();
  const [hasWarranty, setHasWarranty] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'administrator') {
      navigate('/equipment');
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateEquipmentData>({
    resolver: zodResolver(createEquipmentSchema),
  });

  const onSubmit = (data: CreateEquipmentData) => {
    createEquipmentMutation.mutate(data, {
      onSuccess: () => {
        navigate('/equipment');
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Equipo</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Equipo <span className="text-red-500">*</span>
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
                      Marca <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('brand')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.brand && (
                      <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modelo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('model')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.model && (
                      <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Serie <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('serial_number')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.serial_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.serial_number.message}</p>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Compra</label>
                    <input
                      type="date"
                      {...register('purchase_date')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                        Si aplica garantía
                      </label>
                    </div>
                    {hasWarranty && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Garantía Expira</label>
                        <input
                          type="date"
                          {...register('warranty_expires_at')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
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
                    onClick={() => navigate('/equipment')}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createEquipmentMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createEquipmentMutation.isPending ? 'Creando...' : 'Crear Equipo'}
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
