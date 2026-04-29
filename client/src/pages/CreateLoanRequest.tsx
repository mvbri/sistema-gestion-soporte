import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useCreateLoan } from '../hooks/useLoans';
import { useEquipment } from '../hooks/useEquipment';
import { useDireccionesOptions } from '../hooks/useDireccionesOptions';
import { useAuth } from '../hooks/useAuth';

const equipmentStatusLabels: Record<string, string> = {
  available: 'Disponible',
  assigned: 'Asignado',
  maintenance: 'Mantenimiento',
  retired: 'Retirado',
};

const equipmentStatusBadgeStyles: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-900',
  assigned: 'bg-amber-100 text-amber-900',
  maintenance: 'bg-orange-100 text-orange-900',
  retired: 'bg-slate-200 text-slate-800',
};

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
  const canSubmitLoan = isAdministrator ? Boolean(targetIncidentAreaId) : Boolean(userIncidentAreaId);

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
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white px-6 py-5">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Nueva Solicitud de Préstamo</h1>
              <p className="text-sm text-gray-600">Cualquier usuario puede solicitar. IT aprobará la solicitud.</p>
            </div>

            <form onSubmit={submit} className="space-y-6 p-6">
              <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
                  Datos de la solicitud
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Área destino del préstamo
                    <select
                      required
                      value={effectiveTargetAreaId}
                      onChange={(e) =>
                        setTargetIncidentAreaId(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!isAdministrator || isLoadingIncidentAreas || availableIncidentAreas.length === 0}
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
                  </label>
                  {!isAdministrator && !userIncidentAreaId && (
                    <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      Tu usuario no tiene un área registrada. Solicita a un administrador que la configure para poder
                      crear préstamos.
                    </p>
                  )}
                  <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      Rango de préstamo
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Fecha de inicio
                        <input
                          required
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                      <label className="block text-sm font-medium text-gray-700">
                        Fecha estimada de devolución
                        <input
                          required
                          type="date"
                          value={expectedReturnDate}
                          onChange={(e) => setExpectedReturnDate(e.target.value)}
                          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <label className="mt-4 block text-sm font-medium text-gray-700">
                  Motivo / notas
                  <textarea
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Ejemplo: onboarding de nuevo colaborador"
                  />
                </label>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h2 className="mb-2 text-base font-semibold text-gray-900">Equipo solicitado</h2>
                <p className="mb-3 text-xs text-gray-500">
                  Cada solicitud incluye un solo equipo (nombre y número de serie).
                </p>
                <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <select
                    required
                    value={equipmentId === '' ? '' : equipmentId}
                    onChange={(e) =>
                      setEquipmentId(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  {equipmentId !== '' ? (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        equipmentStatusBadgeStyles[selectedStatus] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {equipmentStatusLabels[selectedStatus] || 'No disponible'}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/loans')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createLoan.isPending || !canSubmitLoan}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createLoan.isPending ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
