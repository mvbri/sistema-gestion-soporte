import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCategorias, usePrioridades, useCreateTicketWithFormData, useFrequentIssues } from '../hooks/useTickets';
import { createTicketSchema, type CreateTicketData } from '../schemas/ticketSchemas';
import { useAuth } from '../hooks/useAuth';
import { useEquipment } from '../hooks/useEquipment';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { FrequentIssueIcon } from '../components/icons/FrequentIssueIcon';
import type { EquipmentFilters } from '../types';
import formStyles from '../styles/modules/forms.module.css';

const RequiredMark = () => (
  <span className="text-red-300/90" aria-hidden>
    {' '}
    *
  </span>
);

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
        <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <header className="mb-5 sm:mb-6">
            <h1 className="page-heading">Crear nuevo ticket</h1>
            <p className="page-subheading">
              Describe el incidente con el mayor detalle posible para agilizar la atención.
            </p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="card !p-0 overflow-hidden">
            <div className="content-panel !mb-0 !rounded-none !border-0 !p-5 sm:!p-6 space-y-6">
              <div className={formStyles.formGroup}>
                <label htmlFor="frequent-issue" className="label-field flex items-center gap-2 !mb-2">
                  <FrequentIssueIcon className="h-5 w-5 shrink-0 text-sky-300" />
                  <span>
                    Falla frecuente{' '}
                    <span className="font-normal text-blue-100/50">(opcional)</span>
                  </span>
                </label>
                <select
                  id="frequent-issue"
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
                  className={`input-field w-full py-2.5 ${formStyles.selectField}`}
                >
                  <option value="">Selecciona una falla para autocompletar</option>
                  {frequentIssues.map((issue) => (
                    <option key={issue.id} value={issue.id}>
                      {issue.title}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-blue-100/70">
                  Al elegir una plantilla se completan el título y la descripción; la posible solución se muestra aparte.
                </p>
              </div>

              <div className={formStyles.formGroup}>
                <label htmlFor="ticket-title" className="label-field">
                  Título
                  <RequiredMark />
                </label>
                <input
                  id="ticket-title"
                  {...register('titulo')}
                  type="text"
                  className={`input-field ${errors.titulo ? formStyles.inputError : ''}`}
                />
                {errors.titulo && <p className="error-message">{errors.titulo.message}</p>}
              </div>

              <div className={formStyles.formGroup}>
                <label htmlFor="ticket-description" className="label-field">
                  Descripción
                  <RequiredMark />
                </label>
                <textarea
                  id="ticket-description"
                  {...register('descripcion')}
                  rows={6}
                  className={`input-field resize-y min-h-[9rem] ${errors.descripcion ? formStyles.inputError : ''}`}
                />
                {errors.descripcion && <p className="error-message">{errors.descripcion.message}</p>}
              </div>

              {frequentIssueSolution && (
                <aside
                  className="rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-4 ring-1 ring-emerald-400/20"
                  role="note"
                  aria-labelledby="create-ticket-suggested-solution-heading"
                >
                  <h3
                    id="create-ticket-suggested-solution-heading"
                    className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-100"
                  >
                    <svg
                      className="h-5 w-5 shrink-0 text-emerald-300"
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
                  <p className="text-sm leading-relaxed text-emerald-50/90 whitespace-pre-wrap">
                    {frequentIssueSolution}
                  </p>
                  <p className="mt-3 text-xs text-emerald-200/75">
                    Sugerencia según la plantilla. Si la pruebas, indica en la descripción qué hiciste y qué necesitas del
                    soporte.
                  </p>
                </aside>
              )}

              <div className={formStyles.formGroup}>
                <label htmlFor="ticket-department" className="label-field">
                  Dirección
                  <RequiredMark />
                </label>
                <input
                  id="ticket-department"
                  type="text"
                  value={user?.department ?? 'Sin dirección configurada'}
                  disabled
                  className="input-field opacity-70 cursor-not-allowed"
                />
                {!user?.incident_area_id && (
                  <p className="error-message">
                    Debes configurar tu dirección en tu perfil antes de crear tickets.{' '}
                    <Link
                      to="/perfil"
                      className="font-medium text-red-100 underline hover:text-white"
                    >
                      Actualizar aquí
                    </Link>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className={`${formStyles.formGroup} !mb-0`}>
                  <label htmlFor="ticket-category" className="label-field">
                    Categoría
                    <RequiredMark />
                  </label>
                  <select
                    id="ticket-category"
                    {...register('categoria_id', { valueAsNumber: true })}
                    className={`input-field ${formStyles.selectField} ${errors.categoria_id ? formStyles.inputError : ''}`}
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoria_id?.message && <p className="error-message">{String(errors.categoria_id.message)}</p>}
                </div>

                <div className={`${formStyles.formGroup} !mb-0`}>
                  <label htmlFor="ticket-priority" className="label-field">
                    Prioridad
                    <RequiredMark />
                  </label>
                  <select
                    id="ticket-priority"
                    {...register('prioridad_id', { valueAsNumber: true })}
                    className={`input-field ${formStyles.selectField} ${errors.prioridad_id ? formStyles.inputError : ''}`}
                  >
                    <option value="">Seleccione una prioridad</option>
                    {prioridades.map((prioridad) => (
                      <option key={prioridad.id} value={prioridad.id}>
                        {prioridad.name}
                      </option>
                    ))}
                  </select>
                  {errors.prioridad_id?.message && (
                    <p className="error-message">{String(errors.prioridad_id.message)}</p>
                  )}
                </div>
              </div>

              <div className={formStyles.formGroup}>
                <label htmlFor="equipment-select" className="label-field">
                  Equipos informáticos{' '}
                  <span className="font-normal text-blue-100/50">(opcional)</span>
                </label>
                <select
                  id="equipment-select"
                  name="equipment_ids"
                  multiple
                  value={selectedEquipmentIds.map(String)}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) =>
                      parseInt(option.value, 10),
                    );
                    setSelectedEquipmentIds(selected);
                  }}
                  className="input-field min-h-[120px]"
                  size={5}
                  aria-label="Seleccionar equipos informáticos"
                >
                  {equipos.length === 0 ? (
                    <option disabled>No hay equipos disponibles</option>
                  ) : (
                    equipos.map((equipo) => (
                      <option key={equipo.id} value={equipo.id}>
                        {equipo.name}
                        {equipo.brand && equipo.model ? ` (${equipo.brand} ${equipo.model})` : ''}
                        {equipo.serial_number ? ` - SN: ${equipo.serial_number}` : ''}
                      </option>
                    ))
                  )}
                </select>
                <p className="mt-2 text-xs text-blue-100/70">
                  Mantén presionada Ctrl (o Cmd en Mac) para seleccionar varios equipos
                </p>
                {selectedEquipmentIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedEquipmentIds.map((equipmentId) => {
                      const equipo = equipos.find((e) => e.id === equipmentId);
                      return equipo ? (
                        <span
                          key={equipmentId}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-100 text-sm ring-1 ring-sky-400/30"
                        >
                          {equipo.name}
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedEquipmentIds((prev) => prev.filter((eid) => eid !== equipmentId))
                            }
                            className="ml-2 text-sky-200 hover:text-white"
                            aria-label={`Quitar ${equipo.name}`}
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              <div className={formStyles.formGroup}>
                <label htmlFor="ticket-images" className="label-field">
                  Imágenes del incidente
                  <RequiredMark />
                </label>
                <input
                  id="ticket-images"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="input-field w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-800/80 file:text-slate-100 file:shadow-sm hover:file:bg-slate-700/90 cursor-pointer"
                  required={imagenFiles.length === 0}
                />
                <p className="mt-2 text-xs text-blue-100/70">
                  Hasta 5 imágenes · JPEG, PNG, GIF, WEBP · máx. 5 MB por archivo
                </p>
                {imagenPreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {imagenPreviews.map((preview, index) => (
                      <div key={preview + index} className="relative group">
                        <img
                          src={preview}
                          alt={`Vista previa ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl ring-1 ring-white/15"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-sm shadow-lg hover:bg-rose-500 ring-2 ring-slate-900/80"
                          aria-label={`Eliminar imagen ${index + 1}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <footer className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end border-t border-white/10">
                <button
                  type="button"
                  onClick={() => navigate('/tickets')}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createTicketMutation.isPending || !user?.incident_area_id}
                  className="btn-primary w-full sm:w-auto sm:min-w-[10rem] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createTicketMutation.isPending ? 'Creando...' : 'Crear ticket'}
                </button>
              </footer>
            </div>
          </form>
        </div>
      </PageWrapper>
    </>
  );
};
