import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Laptop, PlusCircle, Ticket } from 'lucide-react';
import { DashboardActionCard } from './DashboardActionCard';

export const TechnicianDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      <DashboardActionCard
        accent="sky"
        icon={Ticket}
        title="Ver Tickets"
        description="Visualiza todos los tickets del sistema"
        onClick={() => navigate('/tickets')}
      />
      <DashboardActionCard
        accent="emerald"
        icon={PlusCircle}
        title="Crear Ticket"
        description="Reporta un incidente como solicitante"
        onClick={() => navigate('/tickets/crear')}
      />
      <DashboardActionCard
        accent="amber"
        icon={ClipboardList}
        title="Panel del Técnico"
        description="Gestiona tus tickets asignados"
        onClick={() => navigate('/tecnico/dashboard')}
      />
      <DashboardActionCard
        accent="violet"
        icon={Laptop}
        title="Solicitar Equipo"
        description="Registra una nueva solicitud de préstamo"
        onClick={() => navigate('/loans/create')}
      />
    </div>
  );
};
