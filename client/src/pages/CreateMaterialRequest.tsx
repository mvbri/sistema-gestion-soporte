import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { useCreateMaterialRequest } from '../hooks/useMaterialRequests';
import type { MaterialType } from '../types';
import { materialRequestItemTypeLabel } from '../utils/materialRequestDisplay';
import formStyles from '../styles/modules/forms.module.css';

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

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 9999;

const clampQuantity = (value: number) =>
  Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.floor(value) || MIN_QUANTITY));

const parseQuantityDigits = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  return clampQuantity(Number.parseInt(digits, 10));
};

interface QuantityStepperProps {
  id: string;
  value: number;
  onChange: (value: number) => void;
}

const QuantityStepper: React.FC<QuantityStepperProps> = ({ id, value, onChange }) => {
  const [draft, setDraft] = useState<string | null>(null);
  const displayValue = draft ?? String(value);

  useEffect(() => {
    setDraft(null);
  }, [value]);

  const commit = (next: number) => {
    setDraft(null);
    onChange(clampQuantity(next));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setDraft(digits);
    const parsed = parseQuantityDigits(digits);
    if (parsed !== null) onChange(parsed);
  };

  const handleBlur = () => {
    if (draft === '' || draft === null) {
      commit(MIN_QUANTITY);
      return;
    }
    const parsed = parseQuantityDigits(draft);
    commit(parsed ?? MIN_QUANTITY);
  };

  const blockNonNumericKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
      e.preventDefault();
    }
  };

  const stepBtnClass =
    'flex flex-1 items-center justify-center px-2 text-sky-200/80 transition-colors hover:bg-sky-500/20 hover:text-white focus:outline-none focus-visible:bg-sky-500/25 disabled:pointer-events-none disabled:opacity-35';

  return (
    <div className="quantity-stepper flex h-[42px] overflow-hidden rounded-xl border border-sky-300/45 bg-slate-900/65 shadow-sm focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/80">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={blockNonNumericKey}
        aria-valuemin={MIN_QUANTITY}
        aria-valuemax={MAX_QUANTITY}
        aria-valuenow={value}
        className="min-w-0 flex-1 bg-transparent px-3 text-center text-sm tabular-nums text-slate-50 focus:outline-none"
      />
      <div
        className="flex w-9 shrink-0 flex-col border-l border-sky-300/35 sm:w-10"
        role="group"
        aria-label="Ajustar cantidad"
      >
        <button
          type="button"
          onClick={() => commit(value + 1)}
          disabled={value >= MAX_QUANTITY}
          className={`${stepBtnClass} border-b border-sky-300/25`}
          aria-label="Aumentar cantidad"
        >
          <ChevronUp className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => commit(value - 1)}
          disabled={value <= MIN_QUANTITY}
          className={stepBtnClass}
          aria-label="Disminuir cantidad"
        >
          <ChevronDown className="h-4 w-4" strokeWidth={2.25} aria-hidden />
        </button>
      </div>
    </div>
  );
};

const RequiredMark = () => (
  <span className="text-red-300/90" aria-hidden>
    {' '}
    *
  </span>
);

export const CreateMaterialRequest: React.FC = () => {
  const navigate = useNavigate();
  const createRequest = useCreateMaterialRequest();
  const [addresseeName, setAddresseeName] = useState('');
  const [addresseeTitle, setAddresseeTitle] = useState('');
  const [addresseeAddressingText, setAddresseeAddressingText] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [items, setItems] = useState<MaterialRequestItemDraft[]>([]);
  const [newItem, setNewItem] = useState<MaterialRequestItemDraft>(defaultItem());

  const addressingLength = addresseeAddressingText.trim().length;
  const canSubmit =
    items.length > 0 &&
    addresseeName.trim().length >= 2 &&
    addresseeTitle.trim().length >= 2 &&
    addressingLength >= 20;

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
    if (!canSubmit) return;

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
        <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <header className="mb-5 sm:mb-6">
            <h1 className="page-heading">Nueva solicitud de materiales</h1>
            <p className="page-subheading">
              Equipos, consumibles y herramientas para revisión administrativa.
            </p>
          </header>

          <form onSubmit={submit} className="card space-y-6 sm:space-y-8 !p-5 sm:!p-8">
            <section aria-labelledby="addressee-heading">
              <h2 id="addressee-heading" className="sr-only">
                Destinatario
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className={formStyles.formGroup}>
                  <label htmlFor="addressee-name" className="label-field">
                    Nombre del destinatario
                    <RequiredMark />
                  </label>
                  <input
                    id="addressee-name"
                    type="text"
                    value={addresseeName}
                    onChange={(e) => setAddresseeName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={255}
                    placeholder="María Pérez González"
                    className="input-dark"
                    autoComplete="name"
                  />
                </div>
                <div className={formStyles.formGroup}>
                  <label htmlFor="addressee-title" className="label-field">
                    Cargo al que se dirige
                    <RequiredMark />
                  </label>
                  <input
                    id="addressee-title"
                    type="text"
                    value={addresseeTitle}
                    onChange={(e) => setAddresseeTitle(e.target.value)}
                    required
                    minLength={2}
                    maxLength={255}
                    placeholder="Director general"
                    className="input-dark"
                  />
                </div>
              </div>

              <div className={`${formStyles.formGroup} !mb-0`}>
                <label htmlFor="addressing-text" className="label-field">
                  Texto dirigido al destinatario
                  <RequiredMark />
                </label>
                <p className="mb-2 text-xs text-blue-100/70">
                  Membrete hacia la persona y cargo indicados: dependencia, motivo de la solicitud (mín. 20
                  caracteres).
                </p>
                <textarea
                  id="addressing-text"
                  value={addresseeAddressingText}
                  onChange={(e) => setAddresseeAddressingText(e.target.value)}
                  required
                  minLength={20}
                  maxLength={4000}
                  rows={4}
                  placeholder="Por medio del presente, y en atención a las funciones de su despacho..."
                  className="input-dark resize-y min-h-[7rem] sm:min-h-[8rem]"
                />
                <p
                  className={`mt-1.5 text-xs tabular-nums ${
                    addressingLength >= 20 ? 'text-sky-200/60' : 'text-amber-200/80'
                  }`}
                >
                  {addressingLength} / 20 caracteres mínimos
                </p>
              </div>

              <div className={`${formStyles.formGroup} !mb-0 mt-4 sm:mt-5`}>
                <label htmlFor="request-notes" className="label-field">
                  Motivo / observaciones
                  <span className="font-normal text-blue-100/50"> (opcional)</span>
                </label>
                <textarea
                  id="request-notes"
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  rows={2}
                  className="input-dark resize-y"
                />
              </div>
            </section>

            <section
              aria-labelledby="materials-heading"
              className="content-panel !mb-0 space-y-4 !p-4 sm:!p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="materials-heading" className="text-base font-semibold text-white sm:text-lg">
                  Materiales solicitados
                </h2>
                <span className="text-xs text-sky-200/70 tabular-nums">{items.length} ítem(s)</span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
                <div className={`${formStyles.formGroup} lg:col-span-3 !mb-0`}>
                  <label htmlFor="item-type" className="label-field text-xs sm:text-sm">
                    Tipo
                  </label>
                  <select
                    id="item-type"
                    value={newItem.material_type}
                    onChange={(e) => {
                      const nextType = e.target.value as MaterialType;
                      setNewItem((prev) => ({ ...prev, material_type: nextType }));
                    }}
                    className={`input-dark ${formStyles.selectField}`}
                  >
                    <option value="equipment">Equipo</option>
                    <option value="consumable">Consumible</option>
                    <option value="tool">Herramienta</option>
                  </select>
                </div>
                <div className={`${formStyles.formGroup} sm:col-span-1 lg:col-span-4 !mb-0`}>
                  <label htmlFor="item-name" className="label-field text-xs sm:text-sm">
                    Nombre
                  </label>
                  <input
                    id="item-name"
                    type="text"
                    value={newItem.material_name}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, material_name: e.target.value }))
                    }
                    placeholder="Toner HP 85A"
                    className="input-dark"
                  />
                </div>
                <div className={`${formStyles.formGroup} sm:col-span-1 lg:col-span-2 !mb-0`}>
                  <label htmlFor="item-desc" className="label-field text-xs sm:text-sm">
                    Descripción
                  </label>
                  <input
                    id="item-desc"
                    type="text"
                    value={newItem.material_description}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, material_description: e.target.value }))
                    }
                    placeholder="Opcional"
                    className="input-dark"
                  />
                </div>
                <div className={`${formStyles.formGroup} sm:col-span-1 lg:col-span-2 !mb-0`}>
                  <label htmlFor="item-qty" className="label-field text-xs sm:text-sm">
                    Cant.
                  </label>
                  <QuantityStepper
                    id="item-qty"
                    value={newItem.quantity}
                    onChange={(quantity) =>
                      setNewItem((prev) => ({ ...prev, quantity }))
                    }
                  />
                </div>
                <div className="group/add relative sm:col-span-2 lg:col-span-1">
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-sky-400/35 bg-slate-950/95 px-2.5 py-1 text-xs font-medium text-sky-50 opacity-0 shadow-lg shadow-sky-950/50 transition-opacity duration-150 group-hover/add:opacity-100 group-focus-within/add:opacity-100 group-has-[:disabled]/add:opacity-0"
                  >
                    Agregar
                  </span>
                  <button
                    type="button"
                    onClick={addItemToList}
                    disabled={!newItem.material_name.trim()}
                    aria-label="Agregar"
                    className="btn-primary flex h-[42px] w-full items-center justify-center px-3 text-sm disabled:opacity-50"
                  >
                    <Plus className="h-5 w-5 shrink-0" strokeWidth={2.25} aria-hidden />
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-sky-400/25 px-4 py-6 text-center text-sm text-blue-100/60">
                  Aún no hay ítems. Completa el formulario y pulsa Agregar.
                </p>
              ) : (
                <ul className="divide-y divide-sky-400/20 rounded-xl border border-sky-400/25 overflow-hidden">
                  {items.map((item, index) => (
                    <li
                      key={`${item.material_type}-${item.material_name}-${index}`}
                      className="flex gap-3 px-3 py-3 sm:px-4 sm:py-3.5 bg-slate-900/30"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">{item.material_name}</p>
                        <p className="mt-0.5 text-xs text-blue-100/65">
                          {materialRequestItemTypeLabel(item.material_type)} · Cant. {item.quantity}
                          {item.material_description ? ` · ${item.material_description}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                        className="shrink-0 self-center rounded-lg p-2 text-sky-200/70 transition-colors hover:bg-red-500/15 hover:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-400/40"
                        aria-label={`Quitar ${item.material_name}`}
                      >
                        <X className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <footer className="flex flex-col-reverse gap-3 border-t border-sky-400/20 pt-5 sm:flex-row sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => navigate('/material-requests')}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createRequest.isPending || !canSubmit}
                className="btn-primary w-full sm:w-auto sm:min-w-[10rem]"
                title={
                  items.length === 0
                    ? 'Agrega al menos un ítem'
                    : !canSubmit
                      ? 'Completa destinatario, cargo y texto (mín. 20 caracteres)'
                      : undefined
                }
              >
                {createRequest.isPending ? 'Enviando…' : 'Enviar solicitud'}
              </button>
            </footer>
          </form>
        </div>
      </PageWrapper>
    </>
  );
};
