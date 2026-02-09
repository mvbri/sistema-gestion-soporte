import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ticketService } from '../services/ticketService';
import { createTicketSchema, type CreateTicketData } from '../schemas/ticketSchemas';
import type { CategoriaTicket, PrioridadTicket, Ticket } from '../types';
import type { ApiResponse } from '../types';

export const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaTicket[]>([]);
  const [prioridades, setPrioridades] = useState<PrioridadTicket[]>([]);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateTicketData>({
    resolver: zodResolver(createTicketSchema),
  });

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [categoriasRes, prioridadesRes] = await Promise.all([
        ticketService.getCategorias(),
        ticketService.getPrioridades(),
      ]);

      if (categoriasRes.success && categoriasRes.data) setCategorias(categoriasRes.data);
      if (prioridadesRes.success && prioridadesRes.data) setPrioridades(prioridadesRes.data);
    } catch (error) {
      toast.error('Error al cargar opciones');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no puede ser mayor a 5MB');
        return;
      }
      setImagenFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CreateTicketData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('titulo', data.titulo);
      formData.append('descripcion', data.descripcion);
      formData.append('area_incidente', data.area_incidente);
      formData.append('categoria_id', data.categoria_id.toString());
      formData.append('prioridad_id', data.prioridad_id.toString());
      
      if (imagenFile) {
        formData.append('imagen', imagenFile);
      }

      const result = await ticketService.createWithFormData(formData);
      if (result.success) {
        toast.success('Ticket creado exitosamente');
        navigate('/tickets');
      } else {
        toast.error(result.message || 'Error al crear ticket');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Ticket</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                {...register('titulo')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.titulo && (
                <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('descripcion')}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Área del Incidente <span className="text-red-500">*</span>
              </label>
              <input
                {...register('area_incidente')}
                type="text"
                placeholder="Ej: Sala de reuniones, Oficina 201, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.area_incidente && (
                <p className="mt-1 text-sm text-red-600">{errors.area_incidente.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('categoria_id', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione una categoría</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
                {errors.categoria_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoria_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridad <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('prioridad_id', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione una prioridad</option>
                  {prioridades.map((prioridad) => (
                    <option key={prioridad.id} value={prioridad.id}>
                      {prioridad.nombre}
                    </option>
                  ))}
                </select>
                {errors.prioridad_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.prioridad_id.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen del Incidente <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Formatos permitidos: JPEG, JPG, PNG, GIF, WEBP. Tamaño máximo: 5MB
              </p>
              {imagenPreview && (
                <div className="mt-4">
                  <img
                    src={imagenPreview}
                    alt="Vista previa"
                    className="max-w-full h-auto max-h-64 rounded-md border border-gray-300"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/tickets')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Crear Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
