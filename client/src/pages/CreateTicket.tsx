import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCategorias, usePrioridades, useCreateTicketWithFormData } from '../hooks/useTickets';
import { createTicketSchema, type CreateTicketData } from '../schemas/ticketSchemas';
import { useAuth } from '../hooks/useAuth';

export const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: categorias = [] } = useCategorias();
  const { data: prioridades = [] } = usePrioridades();
  const createTicketMutation = useCreateTicketWithFormData();
  const [imagenFiles, setImagenFiles] = useState<File[]>([]);
  const [imagenPreviews, setImagenPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTicketData>({
    resolver: zodResolver(createTicketSchema),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const existingCount = imagenFiles.length;
    const availableSlots = 5 - existingCount;
    if (availableSlots <= 0) {
      toast.error('Solo puedes subir hasta 5 imágenes');
      return;
    }

    const selectedFiles = files.slice(0, availableSlots);

    const validFiles: File[] = [];

    selectedFiles.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`La imagen "${file.name}" no puede ser mayor a 5MB`);
        return;
      }
      validFiles.push(file);
    });

    if (!validFiles.length) return;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setImagenFiles((prev) => [...prev, ...validFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagenFiles((prev) => prev.filter((_, i) => i !== index));
    setImagenPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: CreateTicketData) => {
    if (!user?.incident_area_id) {
      toast.error('No tienes una Dirección configurada. Actualiza tu perfil antes de crear un ticket.');
      return;
    }

    const formData = new FormData();
    formData.append('title', data.titulo);
    formData.append('description', data.descripcion);
    formData.append('category_id', data.categoria_id.toString());
    formData.append('priority_id', data.prioridad_id.toString());

    imagenFiles.forEach((file) => {
      formData.append('imagenes', file);
    });

    createTicketMutation.mutate(formData, {
      onSuccess: () => {
        navigate('/tickets');
      },
    });
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
                Dirección <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={user?.department ?? 'Sin dirección configurada'}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
              {!user?.incident_area_id && (
                <p className="mt-1 text-sm text-red-600">
                  Debes configurar tu Dirección en tu perfil antes de crear tickets.
                </p>
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
                      {categoria.name}
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
                      {prioridad.name}
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
                Imágenes del Incidente <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                multiple
                onChange={handleImageChange}
                ref={fileInputRef}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={imagenFiles.length === 0}
              />
              <p className="mt-1 text-xs text-gray-500">
                Puedes subir hasta 5 imágenes. Formatos permitidos: JPEG, JPG, PNG, GIF, WEBP. Tamaño máximo por imagen: 5MB
              </p>
              {imagenPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {imagenPreviews.map((preview, index) => (
                    <div key={preview + index} className="relative">
                      <img
                        src={preview}
                        alt={`Vista previa ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-sm shadow-md hover:bg-red-700"
                        aria-label={`Eliminar imagen ${index + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
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
                disabled={createTicketMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {createTicketMutation.isPending ? 'Creando...' : 'Crear Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
