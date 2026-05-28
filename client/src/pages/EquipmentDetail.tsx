import { useState, useEffect, type ReactNode } from 'react';
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
import {
  InventoryCardAlert,
  inventoryCardClass,
} from '../components/inventory/InventoryCardShell';

type DetailFieldProps = {
  label: string;
  value: ReactNode;
  mono?: boolean;
};

const DetailField: React.FC<DetailFieldProps> = ({ label, value, mono }) => (
  <div className={`${inventoryCardClass} !p-4 hover:border-white/10`}>
    <p className="text-[11px] font-medium uppercase tracking-wider text-[#8a94a6] mb-1.5">{label}</p>
    <div className={`text-sm font-semibold text-white ${mono ? 'font-mono text-xs' : ''}`}>{value}</div>
  </div>
);

const formatDisplayDate = (dateString: string | null | undefined) => {
  if (!dateString) return null;
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
};

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
  const hasActiveLoan = Boolean(equipment?.active_loan_id);
  const displayStatus =
    hasActiveLoan && equipment?.status === 'available' ? 'assigned' : equipment?.status;
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

  const formatDateForInput = (date: string | null | undefined): string => {
    if (!date) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '';
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
        assigned_to_user_id: equipment.assigned_to_user_id,
        description: equipment.description,
        purchase_date: formatDateForInput(equipment.purchase_date),
        warranty_expires_at: formatDateForInput(equipment.warranty_expires_at),
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
  const assignedToName =
    equipment?.assigned_to_user_name ||
    (hasActiveLoan ? equipment?.active_loan_requester_name : null);

  if (loadingEquipment) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="max-w-4xl mx-auto px-4 py-16 flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
              <p className="mt-3 text-sm text-blue-100/80">Cargando equipo…</p>
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
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="card text-center py-12">
              <p className="text-blue-100/90 font-medium">Equipo no encontrado</p>
              <p className="text-sm text-blue-100/60 mt-2">
                El equipo que buscas no existe o ha sido eliminado.
              </p>
              <button type="button" onClick={() => navigate('/equipment')} className="btn-primary mt-6">
                Volver a la lista
              </button>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  const purchaseDateLabel = formatDisplayDate(equipment.purchase_date);
  const warrantyDateLabel = formatDisplayDate(equipment.warranty_expires_at);

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 space-y-6">
          <button
            type="button"
            onClick={() => navigate('/equipment')}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-200/90 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al inventario
          </button>

          <header className="card flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="page-heading truncate">{equipment.name}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={displayStatus ?? equipment.status} />
                {equipment.type_name ? <TypeBadge type={equipment.type_name} /> : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              {canEdit && !isEditing && (
                <>
                  <button type="button" onClick={() => setIsEditing(true)} className="btn-primary">
                    Editar
                  </button>
                  {equipment.status === 'assigned' &&
                    equipment.assigned_to_user_id &&
                    !hasActiveLoan && (
                      <button type="button" onClick={handleUnassign} className="btn-warning">
                        Desasignar
                      </button>
                    )}
                  {equipment.status !== 'assigned' && !hasActiveLoan && (
                    <button type="button" onClick={() => setShowAssignModal(true)} className="btn-secondary">
                      Asignar
                    </button>
                  )}
                </>
              )}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                  className="btn-secondary"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </header>

          <div className="card">
            {!isEditing ? (
              <div className="space-y-5">
                {hasActiveLoan && (
                  <InventoryCardAlert
                    label="En préstamo"
                    value={equipment.active_loan_requester_name || 'Reservado'}
                    variant="soft"
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {equipment.brand ? <DetailField label="Marca" value={equipment.brand} /> : null}
                  {equipment.model ? <DetailField label="Modelo" value={equipment.model} /> : null}
                  {equipment.serial_number ? (
                    <DetailField label="Número de serie" value={equipment.serial_number} mono />
                  ) : null}
                  {equipment.location ? <DetailField label="Ubicación" value={equipment.location} /> : null}
                  {assignedToName && !hasActiveLoan ? (
                    <DetailField label="Asignado a" value={assignedToName} />
                  ) : null}
                  {purchaseDateLabel ? (
                    <DetailField label="Fecha de compra" value={purchaseDateLabel} />
                  ) : null}
                  {warrantyDateLabel ? (
                    <div className={`${inventoryCardClass} !p-4 hover:border-white/10`}>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-[#8a94a6] mb-1.5">
                        Garantía expira
                      </p>
                      <p className="text-sm font-semibold text-emerald-300">{warrantyDateLabel}</p>
                    </div>
                  ) : null}
                </div>

                {equipment.description ? (
                  <div className={`${inventoryCardClass} !p-4 hover:border-white/10`}>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-[#8a94a6] mb-2">
                      Descripción
                    </p>
                    <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">
                      {equipment.description}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="equipment-name" className="label-field">
                    Nombre <span className="text-red-300/90">*</span>
                  </label>
                  <input id="equipment-name" type="text" {...register('name')} className="input-dark w-full" />
                  {errors.name ? <p className="error-message mt-1">{errors.name.message}</p> : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="equipment-brand" className="label-field">
                      Marca
                    </label>
                    <input id="equipment-brand" type="text" {...register('brand')} className="input-dark w-full" />
                  </div>
                  <div>
                    <label htmlFor="equipment-model" className="label-field">
                      Modelo
                    </label>
                    <input id="equipment-model" type="text" {...register('model')} className="input-dark w-full" />
                  </div>
                </div>

                <div>
                  <label htmlFor="equipment-serial" className="label-field">
                    Número de serie
                  </label>
                  <input
                    id="equipment-serial"
                    type="text"
                    {...register('serial_number')}
                    className="input-dark w-full font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="equipment-type" className="label-field">
                      Tipo
                    </label>
                    <Controller
                      name="type_id"
                      control={control}
                      render={({ field }) => (
                        <select
                          id="equipment-type"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
                          className="input-dark w-full"
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
                    <label htmlFor="equipment-status" className="label-field">
                      Estado
                    </label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <select id="equipment-status" {...field} className="input-dark w-full">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="equipment-purchase-date" className="label-field">
                      Fecha de compra
                    </label>
                    <input
                      id="equipment-purchase-date"
                      type="date"
                      {...register('purchase_date')}
                      className="input-dark w-full py-2.5 [color-scheme:dark]"
                    />
                  </div>
                  {hasWarranty ? (
                    <div>
                      <label htmlFor="equipment-warranty" className="label-field">
                        Garantía expira
                      </label>
                      <input
                        id="equipment-warranty"
                        type="date"
                        {...register('warranty_expires_at')}
                        className="input-dark w-full py-2.5 [color-scheme:dark]"
                      />
                    </div>
                  ) : null}
                </div>

                <label className="flex items-center gap-3 cursor-pointer select-none">
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
                    className="h-4 w-4 rounded border-sky-400/40 bg-slate-900/60 text-sky-500 focus:ring-sky-400"
                  />
                  <span className="text-sm text-blue-100/85">Aplica garantía</span>
                </label>

                <div>
                  <label htmlFor="equipment-description" className="label-field">
                    Descripción
                  </label>
                  <textarea
                    id="equipment-description"
                    {...register('description')}
                    rows={4}
                    className="input-dark w-full resize-y min-h-[6rem]"
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-sky-400/20">
                  <button type="submit" disabled={updateEquipmentMutation.isPending} className="btn-primary">
                    {updateEquipmentMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            )}
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
