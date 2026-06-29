import { createPortal } from 'react-dom';

interface ReopenTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isSubmitting?: boolean;
  requireReason?: boolean;
  title?: string;
  confirmLabel?: string;
}

export const ReopenTicketModal: React.FC<ReopenTicketModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
  requireReason = true,
  title = 'Reabrir ticket',
  confirmLabel = 'Reabrir ticket',
}) => {
  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const reason = String(formData.get('reason') || '').trim();
    onConfirm(reason);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
      onClick={isSubmitting ? undefined : onClose}
      aria-hidden={false}
    >
      <div
        className="card w-full max-w-lg space-y-4 pointer-events-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reopen-ticket-title"
        onClick={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 id="reopen-ticket-title" className="text-lg font-semibold text-white">
            {title}
          </h3>
          <p className="text-sm text-blue-100/80">
            {requireReason
              ? 'Indica por qué el problema no quedó resuelto. El ticket volverá a En Proceso.'
              : 'El ticket volverá a En Proceso. Puedes indicar un motivo opcional.'}
          </p>
          <div>
            <label htmlFor="reopen-reason" className="label-field">
              Motivo
              {requireReason ? (
                <span className="text-orange-300/90"> *</span>
              ) : (
                <span className="font-normal text-blue-100/50"> (opcional)</span>
              )}
            </label>
            <textarea
              id="reopen-reason"
              name="reason"
              rows={4}
              required={requireReason}
              minLength={requireReason ? 5 : undefined}
              placeholder="Describe qué sigue fallando o por qué solicitas la reapertura..."
              className="input-dark w-full min-h-[100px] resize-y"
            />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-warning w-full sm:w-auto"
            >
              {isSubmitting ? 'Reabriendo…' : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
