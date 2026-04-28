import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useCreateLoan, useLoanPools } from '../hooks/useLoans';
import { useEquipment } from '../hooks/useEquipment';
import { useDireccionesOptions } from '../hooks/useDireccionesOptions';
import { useAuth } from '../hooks/useAuth';

interface LoanItemDraft {
  mode: 'equipment' | 'pool';
  equipment_id?: number;
  pool_id?: number;
  quantity: number;
}

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
    status: 'available',
    limit: 1000,
  });
  const { data: loanPools, isLoading: isLoadingLoanPools } = useLoanPools();
  const { data: incidentAreas = [], isLoading: isLoadingIncidentAreas } = useDireccionesOptions();
  const availableIncidentAreas = incidentAreas.filter((area) => area.active);
  const [startDate, setStartDate] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [targetIncidentAreaId, setTargetIncidentAreaId] = useState<number | ''>('');
  const [items, setItems] = useState<LoanItemDraft[]>([{ mode: 'equipment', quantity: 1 }]);
  const availableEquipment = equipmentData?.equipment ?? [];
  const availablePools = (loanPools ?? []).filter((pool) => pool.active);
  const isAdministrator = user?.role === 'administrator';
  const userIncidentAreaId = user?.incident_area_id ?? null;
  const userIncidentArea = availableIncidentAreas.find((area) => area.id === userIncidentAreaId);
  const effectiveTargetAreaId = isAdministrator ? targetIncidentAreaId : (userIncidentAreaId ?? '');
  const canSubmitLoan = isAdministrator ? Boolean(targetIncidentAreaId) : Boolean(userIncidentAreaId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payloadItems = items.map((item) =>
      item.mode === 'equipment'
        ? { equipment_id: Number(item.equipment_id), quantity: 1 }
        : { pool_id: Number(item.pool_id), quantity: Number(item.quantity || 1) }
    );
    if (!canSubmitLoan) return;

    await createLoan.mutateAsync({
      target_incident_area_id: Number(effectiveTargetAreaId),
      start_date: startDate,
      expected_return_date: expectedReturnDate,
      request_notes: requestNotes || undefined,
      items: payloadItems,
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
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">Items solicitados</h2>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    onClick={() =>
                      setItems((prev) => [...prev, { mode: 'equipment', quantity: 1 }])
                    }
                  >
                    + Agregar item
                  </button>
                </div>
                <p className="mb-3 text-xs text-gray-500">
                  Puedes solicitar equipos por serial o elementos de pool por cantidad.
                </p>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    (() => {
                      const selectedEquipment = availableEquipment.find((eq) => eq.id === item.equipment_id);
                      const selectedStatus = selectedEquipment?.status || 'retired';
                      return (
                    <div
                      key={index}
                      className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:grid-cols-4"
                    >
                      <select
                        value={item.mode}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((x, i) =>
                              i === index ? { mode: e.target.value as 'equipment' | 'pool', quantity: 1 } : x
                            )
                          )
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="equipment">Equipo (serial)</option>
                        <option value="pool">Pool (stock)</option>
                      </select>
                      {item.mode === 'equipment' ? (
                        <div className="space-y-2">
                          <select
                            required
                            value={item.equipment_id || ''}
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((x, i) => (i === index ? { ...x, equipment_id: Number(e.target.value) } : x))
                              )
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
                          {item.equipment_id && (
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                equipmentStatusBadgeStyles[selectedStatus] || 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {equipmentStatusLabels[selectedStatus] || 'No disponible'}
                            </span>
                          )}
                        </div>
                      ) : (
                        <select
                          required
                          value={item.pool_id || ''}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((x, i) => (i === index ? { ...x, pool_id: Number(e.target.value) } : x))
                            )
                          }
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isLoadingLoanPools || availablePools.length === 0}
                        >
                          <option value="">
                            {isLoadingLoanPools
                              ? 'Cargando categorías...'
                              : availablePools.length === 0
                                ? 'No hay categorías configuradas'
                                : 'Selecciona una categoría'}
                          </option>
                          {availablePools.map((pool) => (
                            <option key={pool.id} value={pool.id}>
                              {pool.name} ({pool.available_stock} disponibles)
                            </option>
                          ))}
                        </select>
                      )}
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((x, i) => (i === index ? { ...x, quantity: Number(e.target.value) } : x))
                          )
                        }
                        disabled={item.mode === 'equipment'}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                        className="w-full rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={items.length === 1}
                      >
                        Eliminar
                      </button>
                    </div>
                      );
                    })()
                  ))}
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
