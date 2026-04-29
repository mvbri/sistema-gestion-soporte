import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCategorias, usePrioridades, useCreateTicketWithFormData, useFrequentIssues } from '../hooks/useTickets';
import { createTicketSchema, type CreateTicketData } from '../schemas/ticketSchemas';
import { useAuth } from '../hooks/useAuth';
import { useEquipment } from '../hooks/useEquipment';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { FrequentIssueIcon } from '../components/icons/FrequentIssueIcon';
import type { EquipmentFilters } from '../types';

export const CreateTicket: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: categorias = [] } = useCategorias();
  const { data: prioridades = [] } = usePrioridades();
  const { data: frequentIssues = [] } = useFrequentIssues();
  const equipmentFilters: EquipmentFilters = {
    limit: 1000,
    ...(user?.role !== 'administrator' ? { for_tickets: true } : {}),
  };
  const { data: equipmentData } = useEquipment(equipmentFilters);
  const equipos = equipmentData?.equipment || [];
  const createTicketMutation = useCreateTicketWithFormData();
  const [imagenFiles, setImagenFiles] = useState<File[]>([]);
  const [imagenPreviews, setImagenPreviews] = useState<string[]>([]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<number[]>([]);
  /** Texto de `possible_solution` de la falla frecuente elegida; se muestra aparte de la descripción. */
  const [frequentIssueSolution, setFrequentIssueSolution] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
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

    if (selectedEquipmentIds.length > 0) {
      formData.append('equipment_ids', JSON.stringify(selectedEquipmentIds));
    }

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
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Crear Nuevo Ticket</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700">
                <FrequentIssueIcon className="h-5 w-5 shrink-0 text-blue-600" />
                Falla frecuente (opcional)
              </label>
              <select
                defaultValue=""
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!raw) {
                    setFrequentIssueSolution(null);
                    return;
                  }
                  const selectedIssueId = Number(raw);
                  const selectedIssue = frequentIssues.find((issue) => issue.id === selectedIssueId);
                  if (!selectedIssue) return;

                  setValue('titulo', selectedIssue.title, { shouldValidate: true });

                  const symptoms = selectedIssue.symptoms?.trim() ?? '';
                  const hint =
                    'Amplía con más detalle: mensajes de error, cuándo ocurrió, qué ya probaste, etc.';
                  const descripcionFromSymptoms =
                    symptoms.length >= 20
                      ? symptoms
                      : symptoms
                        ? `${symptoms}\n\n${hint}`
                        : `Problema según la plantilla «${selectedIssue.title}».\n\n${hint}`;

                  setValue('descripcion', descripcionFromSymptoms, { shouldValidate: true });
                  const solution = selectedIssue.possible_solution?.trim();
                  setFrequentIssueSolution(solution && solution.length > 0 ? solution : null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona una falla para autocompletar</option>
                {frequentIssues.map((issue) => (
                  <option key={issue.id} value={issue.id}>
                    {issue.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Al elegir una plantilla se completan el título y la descripción del problema; la posible solución se
                muestra aparte para que sea más fácil de ver.
              </p>
            </div>

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

            {frequentIssueSolution && (
              <aside
                className="rounded-lg border-2 border-emerald-600 bg-emerald-50 px-4 py-4 sm:px-5"
                role="note"
                aria-labelledby="create-ticket-suggested-solution-heading"
              >
                <h3
                  id="create-ticket-suggested-solution-heading"
                  className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-800"
                >
                  <svg
                    className="h-5 w-5 shrink-0 text-emerald-800"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.75}
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                    />
                  </svg>
                  Posible solución sugerida
                </h3>
                <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{frequentIssueSolution}</p>
                <p className="mt-3 text-xs font-medium text-emerald-800">
                  Sugerencia según la plantilla. Si la pruebas, indica en la descripción qué hiciste y qué necesitas del
                  soporte.
                </p>
              </aside>
            )}

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
                {errors.prioridad_id?.message && (
                  <p className="mt-1 text-sm text-red-600">{String(errors.prioridad_id.message)}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="equipment-select" className="block text-sm font-medium text-gray-700 mb-1">
                Equipos Informáticos (Opcional)
              </label>
              <select
                id="equipment-select"
                name="equipment_ids"
                multiple
                value={selectedEquipmentIds.map(String)}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                  setSelectedEquipmentIds(selected);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                size={5}
                aria-label="Seleccionar equipos informáticos"
              >
                {equipos.length === 0 ? (
                  <option disabled>No hay equipos disponibles</option>
                ) : (
                  equipos.map((equipo) => (
                    <option key={equipo.id} value={equipo.id}>
                      {equipo.name} {equipo.brand && equipo.model ? `(${equipo.brand} ${equipo.model})` : ''} {equipo.serial_number ? `- SN: ${equipo.serial_number}` : ''}
                    </option>
                  ))
                )}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Mantén presionada la tecla Ctrl (o Cmd en Mac) para seleccionar múltiples equipos
              </p>
              {selectedEquipmentIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedEquipmentIds.map((id) => {
                    const equipo = equipos.find(e => e.id === id);
                    return equipo ? (
                      <span
                        key={id}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm"
                      >
                        {equipo.name}
                        <button
                          type="button"
                          onClick={() => setSelectedEquipmentIds(prev => prev.filter(eid => eid !== id))}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
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
      </PageWrapper>
    </>
  );
};
