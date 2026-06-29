import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { TICKET_CLOSURE_CATEGORIES, type TicketClosureCategoryValue } from '../../constants';
import formStyles from '../../styles/modules/forms.module.css';

interface CloseTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (closureReason: string) => void;
  isSubmitting?: boolean;
}

type SelectedCategory = '' | TicketClosureCategoryValue;

const buildClosureReason = (category: TicketClosureCategoryValue, otherReason: string): string => {
  const option = TICKET_CLOSURE_CATEGORIES.find((item) => item.value === category);
  if (!option) return '';

  if (category === 'other') {
    return `Otro: ${otherReason.trim()}`;
  }

  return option.label;
};

export const CloseTicketModal: React.FC<CloseTicketModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SelectedCategory>('');
  const [otherReason, setOtherReason] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory('');
      setOtherReason('');
    }
  }, [isOpen]);

  const isOtherSelected = selectedCategory === 'other';
  const trimmedOtherReason = otherReason.trim();
  const canSubmit =
    selectedCategory !== '' &&
    (!isOtherSelected || trimmedOtherReason.length >= 3);

  const handleClose = () => {
    setSelectedCategory('');
    setOtherReason('');
    onClose();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    const closureReason = buildClosureReason(selectedCategory as TicketClosureCategoryValue, otherReason);
    if (!closureReason) return;

    onConfirm(closureReason);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
      onClick={isSubmitting ? undefined : handleClose}
      aria-hidden={false}
    >
      <div
        className="card w-full max-w-lg space-y-4 pointer-events-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="close-ticket-title"
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 id="close-ticket-title" className="text-lg font-semibold text-white">
            Cerrar ticket
          </h3>
          <p className="text-sm text-blue-100/80">
            El ticket pasará a estado <strong>Cerrado</strong> de forma definitiva. Indica el motivo
            del cierre.
          </p>
          <div>
            <label htmlFor="closure-category" className="label-field">
              Motivo de cierre <span className="text-orange-300/90">*</span>
            </label>
            <select
              id="closure-category"
              name="closure_category"
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value as SelectedCategory)
              }
              required
              className={`input-dark w-full ${formStyles.selectField}`}
              autoFocus
            >
              <option value="" disabled>
                Selecciona un motivo
              </option>
              {TICKET_CLOSURE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          {isOtherSelected && (
            <div>
              <label htmlFor="closure-other-reason" className="label-field mb-1">
                Especifica el motivo <span className="text-orange-300/90">*</span>
              </label>
              <textarea
                id="closure-other-reason"
                name="closure_other_reason"
                value={otherReason}
                onChange={(event) => setOtherReason(event.target.value)}
                required
                minLength={3}
                maxLength={500}
                rows={4}
                placeholder="Describe el motivo del cierre..."
                className="input-dark w-full min-h-[100px] resize-y"
                autoFocus
              />
            </div>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="btn-secondary w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-slate-500 to-slate-600 shadow-lg hover:from-slate-600 hover:to-slate-700 disabled:cursor-not-allowed disabled:opacity-60 transition-all w-full sm:w-auto"
            >
              {isSubmitting ? 'Cerrando…' : 'Cerrar ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
