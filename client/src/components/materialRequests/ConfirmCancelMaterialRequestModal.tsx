import { createPortal } from 'react-dom';
import type { FC } from 'react';

interface ConfirmCancelMaterialRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  requestCode: string;
  wasApproved?: boolean;
  isConfirming?: boolean;
}

export const ConfirmCancelMaterialRequestModal: FC<ConfirmCancelMaterialRequestModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  requestCode,
  wasApproved = false,
  isConfirming = false,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9999] bg-gray-900/50 backdrop-blur-[2px] transition-opacity"
        onClick={isConfirming ? undefined : onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none sm:p-6">
        <div
          className="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl shadow-gray-900/10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-material-request-title"
        >
          <div className="p-6 sm:p-7">
            <div className="flex gap-4 sm:gap-5">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 ring-8 ring-rose-50/80"
                aria-hidden="true"
              >
                <svg
                  className="h-6 w-6 text-rose-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1 space-y-3 pt-0.5">
                <h3
                  id="cancel-material-request-title"
                  className="text-base font-semibold leading-6 text-gray-900 sm:text-lg sm:leading-7"
                >
                  Confirmar cancelación
                </h3>
                <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                  <p>
                    ¿Estás seguro de que deseas cancelar la solicitud{' '}
                    <span className="rounded-md bg-slate-50 px-1.5 py-0.5 font-medium text-slate-700">
                      {requestCode}
                    </span>
                    ? Esta acción quedará registrada en el historial.
                  </p>
                  {wasApproved && (
                    <p className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-amber-900">
                      <span className="font-semibold">Aprobada:</span> esta solicitud corresponde a
                      gestión entre departamentos y no modifica el inventario local.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/95 px-6 py-4 sm:flex-row sm:flex-row-reverse sm:items-center sm:justify-end sm:gap-3 sm:px-7 sm:py-4">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isConfirming}
              className="group inline-flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-900/15 transition hover:from-rose-700 hover:to-red-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 sm:w-auto sm:min-w-[11rem]"
            >
              <svg
                className="h-5 w-5 shrink-0 transition-transform group-hover:scale-105"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              {isConfirming ? 'Cancelando…' : 'Confirmar cancelación'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isConfirming}
              className="inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-200/60 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 sm:w-auto"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
