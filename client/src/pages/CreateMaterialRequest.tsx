import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useCreateMaterialRequest } from '../hooks/useMaterialRequests';
import type { MaterialType } from '../types';
import { materialRequestItemTypeLabel } from '../utils/materialRequestDisplay';

interface MaterialRequestItemDraft {
  material_type: MaterialType;
  material_name: string;
  material_description: string;
  quantity: number;
}

const defaultItem = (): MaterialRequestItemDraft => ({
  material_type: 'consumable',
  material_name: '',
  material_description: '',
  quantity: 1,
});

export const CreateMaterialRequest: React.FC = () => {
  const navigate = useNavigate();
  const createRequest = useCreateMaterialRequest();
  const [addresseeName, setAddresseeName] = useState('');
  const [addresseeTitle, setAddresseeTitle] = useState('');
  const [addresseeAddressingText, setAddresseeAddressingText] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [items, setItems] = useState<MaterialRequestItemDraft[]>([]);
  const [newItem, setNewItem] = useState<MaterialRequestItemDraft>(defaultItem());

  const addItemToList = () => {
    if (!newItem.material_name.trim()) return;

    setItems((prev) => [
      ...prev,
      {
        material_type: newItem.material_type,
        material_name: newItem.material_name.trim(),
        material_description: newItem.material_description.trim(),
        quantity: Number(newItem.quantity || 1),
      },
    ]);
    setNewItem(defaultItem());
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (
      !addresseeName.trim() ||
      !addresseeTitle.trim() ||
      addresseeAddressingText.trim().length < 20
    ) {
      return;
    }

    const payloadItems = items.map((item) => ({
      source_mode: 'manual' as const,
      material_type: item.material_type,
      custom_material_name: item.material_name.trim(),
      custom_material_description: item.material_description.trim() || undefined,
      quantity: Number(item.quantity || 1),
    }));

    await createRequest.mutateAsync({
      addressee_name: addresseeName.trim(),
      addressee_title: addresseeTitle.trim(),
      addressee_addressing_text: addresseeAddressingText.trim(),
      request_notes: requestNotes || undefined,
      items: payloadItems,
    });

    navigate('/material-requests');
  };

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white px-6 py-5">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Nueva Solicitud de Materiales</h1>
              <p className="text-sm text-gray-600">
                Solicita equipos, consumibles y herramientas para revisión administrativa.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del destinatario <span className="text-red-600">*</span>
                  <input
                    type="text"
                    value={addresseeName}
                    onChange={(e) => setAddresseeName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={255}
                    placeholder="Ej: María Pérez González"
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  Cargo al que se dirige <span className="text-red-600">*</span>
                  <input
                    type="text"
                    value={addresseeTitle}
                    onChange={(e) => setAddresseeTitle(e.target.value)}
                    required
                    minLength={2}
                    maxLength={255}
                    placeholder="Ej: Director general"
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-gray-700">
                Texto dirigido al destinatario <span className="text-red-600">*</span>
                <span className="mt-0.5 block text-xs font-normal text-gray-600">
                  Redacte un membrete hacia la persona y el cargo indicados: indique la dependencia o
                  unidad de ese cargo y el motivo por el cual solicita los materiales (mín. 20
                  caracteres).
                </span>
                <textarea
                  value={addresseeAddressingText}
                  onChange={(e) => setAddresseeAddressingText(e.target.value)}
                  required
                  minLength={20}
                  maxLength={4000}
                  rows={5}
                  placeholder={`Ej: Por medio del presente, y en atención a las funciones de su despacho como Director(a) de la Dirección de X, solicito respetuosamente...`}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </label>

              <label className="block text-sm font-medium text-gray-700">
                Motivo / observaciones
                <textarea
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
                />
              </label>

              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">Materiales solicitados</h2>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Agregar item</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
                      <label className="block min-w-0 text-sm text-gray-700 sm:col-span-1 lg:col-span-3">
                        Tipo de material
                        <select
                          value={newItem.material_type}
                          onChange={(e) => {
                            const nextType = e.target.value as MaterialType;
                            setNewItem((prev) => ({
                              ...prev,
                              material_type: nextType,
                            }));
                          }}
                          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        >
                          <option value="equipment">Equipo</option>
                          <option value="consumable">Consumible</option>
                          <option value="tool">Herramienta</option>
                        </select>
                      </label>
                      <label className="block min-w-0 text-sm text-gray-700 sm:col-span-1 lg:col-span-3">
                        Nombre del material
                        <input
                          type="text"
                          value={newItem.material_name}
                          onChange={(e) =>
                            setNewItem((prev) => ({ ...prev, material_name: e.target.value }))
                          }
                          placeholder="Ej: toner HP 85A"
                          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </label>
                      <label className="block min-w-0 text-sm text-gray-700 sm:col-span-2 lg:col-span-3">
                        Descripción (opcional)
                        <input
                          type="text"
                          value={newItem.material_description}
                          onChange={(e) =>
                            setNewItem((prev) => ({ ...prev, material_description: e.target.value }))
                          }
                          placeholder="Marca, referencia o detalle"
                          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </label>
                      <label className="block min-w-0 text-sm text-gray-700 sm:col-span-1 lg:col-span-1">
                        Cant.
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={newItem.quantity}
                          onChange={(e) =>
                            setNewItem((prev) => ({
                              ...prev,
                              quantity: Number(e.target.value || 1),
                            }))
                          }
                          className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={addItemToList}
                        disabled={!newItem.material_name.trim()}
                        className="h-10 w-full min-w-0 rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 sm:col-span-1 lg:col-span-2"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white">
                    <div className="border-b border-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
                      Items agregados ({items.length})
                    </div>
                    {items.length === 0 ? (
                      <p className="px-4 py-4 text-sm text-gray-500">
                        Aun no has agregado items. Usa el formulario superior para agregarlos.
                      </p>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {items.map((item, index) => (
                          <li
                            key={`${item.material_type}-${item.material_name}-${index}`}
                            className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.material_name}
                              </p>
                              <p className="text-xs text-gray-600">
                                Tipo: {materialRequestItemTypeLabel(item.material_type)} | Cantidad:{' '}
                                {item.quantity}
                                {item.material_description ? ` | ${item.material_description}` : ''}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                              className="inline-flex shrink-0 items-center justify-center self-start rounded-full p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/40 md:self-auto"
                              aria-label="Quitar item de la lista"
                            >
                              <X className="h-4 w-4" strokeWidth={2} aria-hidden />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/material-requests')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    createRequest.isPending ||
                    items.length === 0 ||
                    !addresseeName.trim() ||
                    !addresseeTitle.trim() ||
                    addresseeAddressingText.trim().length < 20
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60"
                  title={
                    items.length === 0
                      ? 'Agrega al menos un item para enviar la solicitud'
                      : !addresseeName.trim() ||
                          !addresseeTitle.trim() ||
                          addresseeAddressingText.trim().length < 20
                        ? 'Completa destinatario, cargo y el texto dirigido al destinatario (mín. 20 caracteres)'
                        : undefined
                  }
                >
                  {createRequest.isPending ? 'Enviando...' : 'Enviar solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
