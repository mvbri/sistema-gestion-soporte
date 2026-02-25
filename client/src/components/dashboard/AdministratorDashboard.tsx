import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AdministratorDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <button
        onClick={() => navigate('/tickets')}
        className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <h3 className="font-bold text-lg mb-2">Ver Tickets</h3>
        <p className="text-sm">Gestiona y visualiza todos los tickets</p>
      </button>
      <button
        onClick={() => navigate('/analytics')}
        className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <h3 className="font-bold text-lg mb-2">Analíticas</h3>
        <p className="text-sm">Estadísticas y métricas del sistema</p>
      </button>
      <button
        onClick={() => navigate('/admin/config')}
        className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <h3 className="font-bold text-lg mb-2">Configuración</h3>
        <p className="text-sm">Gestiona categorías, prioridades, direcciones...</p>
      </button>
      <button
        onClick={() => navigate('/admin/users')}
        className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <h3 className="font-bold text-lg mb-2">Gestión de Usuarios</h3>
        <p className="text-sm">Crea, activa y gestiona usuarios del sistema</p>
      </button>
    </div>
  );
};
