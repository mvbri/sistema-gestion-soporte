import type { Ticket } from '../../types';

interface TicketAssignedStatsProps {
  tickets: Ticket[];
}

export const TicketAssignedStats: React.FC<TicketAssignedStatsProps> = ({ tickets }) => {
  const countByState = (stateId: number) =>
    tickets.filter((t) => t.state_id === stateId).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <div className="stat-card stat-card--sky">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="stat-card-title">Todos</p>
            <p className="stat-card-value">{tickets.length}</p>
          </div>
          <div className="stat-card-icon stat-card-icon--sky">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            </svg>
          </div>
        </div>
      </div>
      <div className="stat-card stat-card--sky">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="stat-card-title">Abiertos</p>
            <p className="stat-card-value">{countByState(1)}</p>
          </div>
          <div className="stat-card-icon stat-card-icon--sky">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>
      </div>
      <div className="stat-card stat-card--amber">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="stat-card-title">Asignados</p>
            <p className="stat-card-value">{countByState(2)}</p>
          </div>
          <div className="stat-card-icon stat-card-icon--amber">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="stat-card stat-card--amber">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="stat-card-title">En proceso</p>
            <p className="stat-card-value">{countByState(3)}</p>
          </div>
          <div className="stat-card-icon stat-card-icon--amber">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="stat-card stat-card--emerald">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="stat-card-title">Resueltos</p>
            <p className="stat-card-value">{countByState(4)}</p>
          </div>
          <div className="stat-card-icon stat-card-icon--emerald">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="stat-card stat-card--violet">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="stat-card-title">Cerrados</p>
            <p className="stat-card-value">{countByState(5)}</p>
          </div>
          <div className="stat-card-icon stat-card-icon--violet">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
