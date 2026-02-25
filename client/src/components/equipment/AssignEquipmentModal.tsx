import { useState } from 'react';
import type { AssignEquipmentData } from '../../schemas/equipmentSchemas';

interface AssignEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: AssignEquipmentData) => void;
  users: Array<{ id: number; full_name: string; email: string }>;
  equipmentName: string;
  isLoading?: boolean;
}

export const AssignEquipmentModal: React.FC<AssignEquipmentModalProps> = ({
  isOpen,
  onClose,
  onAssign,
  users,
  equipmentName,
  isLoading = false,
}) => {
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId && typeof selectedUserId === 'number') {
      onAssign({ user_id: selectedUserId });
      setSelectedUserId('');
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Asignar Equipo: {equipmentName}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Usuario
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              >
                <option value="">Seleccione un usuario</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading || !selectedUserId}
              >
                {isLoading ? 'Asignando...' : 'Asignar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
