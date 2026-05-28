import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useCreateLoan } from '../hooks/useLoans';
import { useEquipment } from '../hooks/useEquipment';
import { useDireccionesOptions } from '../hooks/useDireccionesOptions';
import { useAuth } from '../hooks/useAuth';
import formStyles from '../styles/modules/forms.module.css';

const equipmentStatusLabels: Record<string, string> = {
  available: 'Disponible',
  assigned: 'Asignado',
  maintenance: 'Mantenimiento',
  retired: 'Retirado',
};

const equipmentStatusBadgeStyles: Record<string, string> = {
  available: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/35',
  assigned: 'bg-amber-500/20 text-amber-200 border border-amber-400/35',
  maintenance: 'bg-orange-500/20 text-orange-200 border border-orange-400/35',
  retired: 'bg-slate-500/25 text-slate-200 border border-slate-400/30',
};

const RequiredMark = () => (
  <span className="text-red-300/90" aria-hidden>
    {' '}
    *
  </span>
);

export const CreateLoanRequest: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createLoan = useCreateLoan();
  const { data: equipmentData, isLoading: isLoadingEquipment } = useEquipment({
    for_loans: true,
    limit: 1000,
  });
  const { data: incidentAreas = [], isLoading: isLoadingIncidentAreas } = useDireccionesOptions();
  const availableIncidentAreas = incidentAreas.filter((area) => area.active);
  const [startDate, setStartDate] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [targetIncidentAreaId, setTargetIncidentAreaId] = useState<number | ''>('');
  const [equipmentId, setEquipmentId] = useState<number | ''>('');
  const availableEquipment = equipmentData?.equipment ?? [];
  const selectedEquipment =
    equipmentId === '' ? undefined : availableEquipment.find((eq) => eq.id === equipmentId);
  const selectedStatus = selectedEquipment?.status || 'retired';
  const isAdministrator = user?.role === 'administrator';
  const userIncidentAreaId = user?.incident_area_id ?? null;
  const userIncidentArea = availableIncidentAreas.find((area) => area.id === userIncidentAreaId);
  const effectiveTargetAreaId = isAdministrator ? targetIncidentAreaId : (userIncidentAreaId ?? '');
  const hasTargetArea = isAdministrator ? Boolean(targetIncidentAreaId) : Boolean(userIncidentAreaId);
  const hasEquipmentSelected = equipmentId !== '';
  const hasDatesSelected = Boolean(startDate && expectedReturnDate);
  const isValidDateRange = !hasDatesSelected || expectedReturnDate >= startDate;
  const canSubmitLoan = hasTargetArea && hasEquipmentSelected && hasDatesSelected && isValidDateRange;
  const submitErrorMessage =
    createLoan.error && typeof createLoan.error === 'object' && 'message' in createLoan.error
      ? String((createLoan.error as { message?: unknown }).message || '')
      : '';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitLoan) return;

    await createLoan.mutateAsync({
      target_incident_area_id: Number(effectiveTargetAreaId),
      start_date: startDate,
      expected_return_date: expectedReturnDate,
      request_notes: requestNotes || undefined,
      items: [{ equipment_id: Number(equipmentId), quantity: 1 }],
    });
    navigate('/loans');
  };

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <header className="mb-5 sm:mb-6">
            <h1 className="page-heading">Nueva solicitud de préstamo</h1>
            <p className="page-subheading">
              Cualquier usuario puede solicitar. IT aprobará la solicitud.
            </p>
          </header>

          <form onSubmit={submit} className="card space-y-6 sm:space-y-8 !p-5 sm:!p-8">
            {createLoan.isError ? (
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100/90">
                <p className="font-semibold text-rose-100">No se pudo crear la solicitud.</p>
                {submitErrorMessage ? (
                  <p className="mt-1 text-xs text-rose-100/80">{submitErrorMessage}</p>
                ) : null}
              </div>
            ) : null}

            <section aria-labelledby="loan-request-data-heading">
              <h2 id="loan-request-data-heading" className="sr-only">
                Datos de la solicitud
              </h2>

              <div className={formStyles.formGroup}>
                <label htmlFor="target-incident-area" className="label-field">
                  Área destino del préstamo
                  <RequiredMark />
                </label>
                <select
                  id="target-incident-area"
                  required
                  value={effectiveTargetAreaId}
                  onChange={(e) =>
                    setTargetIncidentAreaId(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className={`input-dark ${formStyles.selectField}`}
                  disabled={
                    !isAdministrator || isLoadingIncidentAreas || availableIncidentAreas.length === 0
                  }
                >
                  {isAdministrator ? (
                    <option value="">
                      {isLoadingIncidentAreas
                        ? 'Cargando áreas...'
                        : availableIncidentAreas.length === 0
                          ? 'No hay áreas disponibles'
                          : 'Selecciona el área destino'}
                    </option>
                  ) : (
                    <option value={userIncidentAreaId ?? ''}>
                      {userIncidentArea?.name || user?.department || 'Sin área registrada'}
                    </option>
                  )}
                  {availableIncidentAreas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              {!isAdministrator && !userIncidentAreaId && (
                <p className="mb-4 rounded-lg border border-amber-400/35 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-100/90">
                  Tu usuario no tiene un área registrada. Solicita a un administrador que la configure
                  para poder crear préstamos.
                </p>
              )}

              <section
                aria-labelledby="loan-date-range-heading"
                className="content-panel content-panel--sky !mb-0 space-y-4 !p-4 sm:!p-5"
              >
                <h2
                  id="loan-date-range-heading"
                  className="text-base font-semibold text-sky-50 sm:text-lg"
                >
                  Rango de préstamo
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  <div className={`${formStyles.formGroup} !mb-0`}>
                    <label htmlFor="start-date" className="label-field">
                      Fecha de inicio
                      <RequiredMark />
                    </label>
                    <input
                      id="start-date"
                      required
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="input-dark py-2.5 [color-scheme:dark]"
                    />
                  </div>
                  <div className={`${formStyles.formGroup} !mb-0`}>
                    <label htmlFor="expected-return-date" className="label-field">
                      Fecha estimada de devolución
                      <RequiredMark />
                    </label>
                    <input
                      id="expected-return-date"
                      required
                      type="date"
                      value={expectedReturnDate}
                      onChange={(e) => setExpectedReturnDate(e.target.value)}
                      className="input-dark py-2.5 [color-scheme:dark]"
                    />
                    {!isValidDateRange && (
                      <p className="mt-1.5 text-xs text-amber-200/80">
                        La fecha de devolución debe ser igual o posterior a la fecha de inicio.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <div className={`${formStyles.formGroup} !mb-0 mt-4 sm:mt-5`}>
                <label htmlFor="request-notes" className="label-field">
                  Motivo / notas
                  <span className="font-normal text-blue-100/50"> (opcional)</span>
                </label>
                <textarea
                  id="request-notes"
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  rows={3}
                  placeholder="Ejemplo: onboarding de nuevo colaborador"
                  className="input-dark resize-y min-h-[5.5rem]"
                />
              </div>
            </section>

            <section
              aria-labelledby="loan-equipment-heading"
              className="content-panel content-panel--violet !mb-0 space-y-4 !p-4 sm:!p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="loan-equipment-heading" className="text-base font-semibold text-violet-50 sm:text-lg">
                  Equipo solicitado
                </h2>
                <span className="text-xs font-medium text-violet-200/80">1 equipo por solicitud</span>
              </div>
              <p className="text-xs text-blue-100/70">
                Cada solicitud incluye un solo equipo (nombre y número de serie).
              </p>
              {!isLoadingEquipment && availableEquipment.length === 0 ? (
                <p className="rounded-lg border border-amber-400/35 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-100/90">
                  No hay equipos disponibles para préstamo en este momento.
                </p>
              ) : null}

              <div className={`${formStyles.formGroup} !mb-0`}>
                <label htmlFor="equipment-id" className="label-field">
                  Equipo
                  <RequiredMark />
                </label>
                <select
                  id="equipment-id"
                  required
                  value={equipmentId === '' ? '' : equipmentId}
                  onChange={(e) =>
                    setEquipmentId(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className={`input-dark ${formStyles.selectField}`}
                  disabled={isLoadingEquipment || availableEquipment.length === 0}
                >
                  <option value="">
                    {isLoadingEquipment
                      ? 'Cargando equipos disponibles...'
                      : availableEquipment.length === 0
                        ? 'No hay equipos disponibles'
                        : 'Selecciona un equipo'}
                  </option>
                  {availableEquipment.map((equipment) => (
                    <option key={equipment.id} value={equipment.id}>
                      {equipment.name}
                      {equipment.serial_number ? ` - SN: ${equipment.serial_number}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {equipmentId !== '' && selectedEquipment ? (
                <div className="info-tile">
                  <p className="truncate text-sm font-medium text-white">{selectedEquipment.name}</p>
                  {selectedEquipment.serial_number ? (
                    <p className="mt-0.5 text-xs text-blue-100/65">
                      SN: {selectedEquipment.serial_number}
                    </p>
                  ) : null}
                  <span
                    className={`mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      equipmentStatusBadgeStyles[selectedStatus] ||
                      'bg-slate-500/25 text-slate-200 border border-slate-400/30'
                    }`}
                  >
                    {equipmentStatusLabels[selectedStatus] || 'No disponible'}
                  </span>
                </div>
              ) : null}
            </section>

            <footer className="flex flex-col-reverse gap-3 border-t border-sky-400/20 pt-5 sm:flex-row sm:justify-end sm:gap-3">
              {!canSubmitLoan && (
                <p className="w-full text-xs text-blue-100/70 sm:mr-auto sm:w-auto sm:self-center">
                  Completa área, fechas válidas y selecciona un equipo para enviar.
                </p>
              )}
              <button
                type="button"
                onClick={() => navigate('/loans')}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createLoan.isPending || !canSubmitLoan}
                className="btn-primary w-full sm:w-auto sm:min-w-[10rem] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createLoan.isPending ? 'Enviando…' : 'Enviar solicitud'}
              </button>
            </footer>
          </form>
        </div>
      </PageWrapper>
    </>
  );
};
