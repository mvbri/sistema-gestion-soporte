import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Laptop, PlusCircle, Ticket } from 'lucide-react';
import { DashboardActionCard } from './DashboardActionCard';

export const EndUserDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      <DashboardActionCard
        accent="sky"
        icon={Ticket}
        title="Ver Tickets"
        description="Visualiza solo tus tickets"
        onClick={() => navigate('/tickets')}
      />
      <DashboardActionCard
        accent="emerald"
        icon={PlusCircle}
        title="Crear Ticket"
        description="Reporta un nuevo incidente"
        onClick={() => navigate('/tickets/crear')}
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
