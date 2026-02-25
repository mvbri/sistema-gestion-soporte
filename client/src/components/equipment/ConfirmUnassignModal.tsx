import { createPortal } from 'react-dom';

interface ConfirmUnassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  equipmentName: string;
}

export const ConfirmUnassignModal: React.FC<ConfirmUnassignModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  equipmentName,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 z-[9999]" onClick={onClose}></div>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-none">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full pointer-events-auto">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-start">
              <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Confirmar desasignación
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    ¿Estás seguro de que deseas desasignar el equipo <strong>"{equipmentName}"</strong>?
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              className="group inline-flex justify-center items-center gap-2 w-full px-5 py-2.5 text-base font-medium text-white bg-gradient-to-r from-yellow-500 to-yellow-600 border border-transparent rounded-lg shadow-md hover:from-yellow-600 hover:to-yellow-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              Desasignar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center w-full px-5 py-2.5 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
