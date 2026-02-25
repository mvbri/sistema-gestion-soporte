import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import {
  useToolById,
  useToolTypes,
  useToolStatuses,
  useUpdateTool,
} from '../hooks/useTools';
import { updateToolSchema, type UpdateToolData } from '../schemas/toolSchemas';
import { ToolStatusBadge } from '../components/tools/ToolStatusBadge';

export const ToolDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const toolId = id ? parseInt(id, 10) : undefined;
  const { data: tool, isLoading: loadingTool } = useToolById(toolId);
  const { data: types = [] } = useToolTypes();
  const { data: statuses = [] } = useToolStatuses();

  const updateToolMutation = useUpdateTool();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<UpdateToolData>({
    resolver: zodResolver(updateToolSchema),
  });

  useEffect(() => {
    if (tool) {
      reset({
        name: tool.name,
        code: tool.code ?? undefined,
        type_id: tool.type_id,
        status: tool.status,
        condition: tool.condition,
        location: tool.location ?? undefined,
        description: tool.description ?? undefined,
      });
    }
  }, [tool, reset]);

  const onSubmit = (data: UpdateToolData) => {
    if (!toolId) return;
    updateToolMutation.mutate(
      { id: toolId, data },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const canEdit = user?.role === 'administrator' || user?.role === 'technician';

  if (loadingTool) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando herramienta...</p>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  if (!tool) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Herramienta no encontrada</p>
            <button
              onClick={() => navigate('/tools')}
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
        <div className="max-w-4xl mx-auto.py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{tool.name}</h2>
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
                    onClick={() => navigate('/tools')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Volver
                  </button>
                </div>
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <ToolStatusBadge status={tool.status} />
                    {tool.type_name && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {tool.type_name}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tool.code && (
                      <div>
                        <span className="font-medium text-gray-700">Código:</span>
                        <p className="text-gray-900">{tool.code}</p>
                      </div>
                    )}
                    {tool.location && (
                      <div>
                        <span className="font-medium text-gray-700">Ubicación:</span>
                        <p className="text-gray-900">{tool.location}</p>
                      </div>
                    )}
                    {tool.assigned_to_user_name && (
                      <div>
                        <span className="font-medium text-gray-700">Asignada a:</span>
                        <p className="text-gray-900">{tool.assigned_to_user_name}</p>
                      </div>
                    )}
                    {tool.condition && (
                      <div>
                        <span className="font-medium text-gray-700">Condición:</span>
                        <p className="text-gray-900">{tool.condition}</p>
                      </div>
                    )}
                  </div>

                  {tool.description && (
                    <div>
                      <span className="font-medium text-gray-700">Descripción:</span>
                      <p className="text-gray-900 mt-1">{tool.description}</p>
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
                      <label className="block text-sm font-medium.text-gray-700 mb-2">Código</label>
                      <input
                        type="text"
                        {...register('code')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                      <Controller
                        name="type_id"
                        control={control}
                        render={({ field }) => (
                          <select
                            {...field}
                            value={field.value || ''}
                            onChange={(e) =>
                              field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)
                            }
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Condición</label>
                      <select
                        {...register('condition')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="new">Nueva</option>
                        <option value="good">Buena</option>
                        <option value="worn">Desgastada</option>
                        <option value="broken">Dañada</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                    <input
                      type="text"
                      {...register('location')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {errors.location && (
                      <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                    )}
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
                      disabled={updateToolMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updateToolMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
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

