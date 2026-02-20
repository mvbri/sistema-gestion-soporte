import React from 'react';
import { useNavigate } from 'react-router-dom';

export const TechnicianDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <button
        onClick={() => navigate('/tickets')}
        className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <h3 className="font-bold text-lg mb-2">Ver Tickets</h3>
        <p className="text-sm">Visualiza todos los tickets del sistema</p>
      </button>
      <button
        onClick={() => navigate('/tecnico/dashboard')}
        className="p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
      >
        <h3 className="font-bold text-lg mb-2">Panel del Técnico</h3>
        <p className="text-sm">Gestiona tus tickets asignados</p>
      </button>
    </div>
  );
};
