import type { Ticket, TicketListTab } from '../../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';

interface TicketListItemProps {
  ticket: Ticket;
  activeTab: TicketListTab;
  userId?: number;
  userRole?: string;
  formatDate: (dateString: string | null | undefined) => string;
  onView: (ticketId: string) => void;
  onEdit?: (ticketId: string) => void;
  onDelete?: (ticket: Ticket) => void;
  onStartProgress?: (ticketId: string) => void;
  onMarkResolved?: (ticketId: string) => void;
  isStartingProgress?: boolean;
  isMarkingResolved?: boolean;
}

export const TicketListItem: React.FC<TicketListItemProps> = ({
  ticket,
  activeTab,
  userId,
  userRole,
  formatDate,
  onView,
  onEdit,
  onDelete,
  onStartProgress,
  onMarkResolved,
  isStartingProgress = false,
  isMarkingResolved = false,
}) => {
  const stateId = ticket.state_id ?? ticket.estado_id;
  const isAssignee = userId !== undefined && ticket.assigned_technician_id === userId;
  const showWorkflowActions = activeTab === 'assigned' && isAssignee;

  const endUserCanMarkResolved =
    userRole === 'end_user' &&
    userId === ticket.created_by_user_id &&
    (stateId === 2 || stateId === 3);

  return (
    <li className="px-4 sm:px-6 py-4 hover:bg-sky-50/90 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <p className="text-sm sm:text-base font-medium text-gray-900 truncate w-full sm:w-auto">
              {ticket.title}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge estado={ticket.state_name || ''} colorOverride={ticket.state_color} />
              <PriorityBadge prioridad={ticket.priority_name || ''} colorOverride={ticket.priority_color} />
              <CategoryBadge categoria={ticket.category_name || ''} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <span className="truncate">ID: {ticket.id.substring(0, 8)}...</span>
            <span className="truncate">Creado: {formatDate(ticket.created_at)}</span>
            {ticket.closed_at && (
              <span className="truncate">Cerrado: {formatDate(ticket.closed_at)}</span>
            )}
            <span className="truncate">Por: {ticket.created_by_user_name || 'N/A'}</span>
            {ticket.assigned_technician_name && (
              <span className="truncate">Asignado a: {ticket.assigned_technician_name}</span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end sm:justify-start flex-wrap gap-2 flex-shrink-0">
          {showWorkflowActions && stateId === 2 && onStartProgress && (
            <button
              type="button"
              onClick={() => onStartProgress(ticket.id)}
              disabled={isStartingProgress}
              className="btn-warning px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50 whitespace-nowrap"
            >
              Iniciar progreso
            </button>
          )}
          {showWorkflowActions && stateId === 3 && onMarkResolved && (
            <button
              type="button"
              onClick={() => onMarkResolved(ticket.id)}
              disabled={isMarkingResolved}
              className="btn-primary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50 whitespace-nowrap"
            >
              {isMarkingResolved ? 'Marcando…' : 'Marcar resuelto'}
            </button>
          )}
          {endUserCanMarkResolved && onMarkResolved && (
            <button
              type="button"
              onClick={() => onMarkResolved(ticket.id)}
              disabled={isMarkingResolved}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:from-green-600 hover:to-green-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out whitespace-nowrap disabled:opacity-50"
            >
              {isMarkingResolved ? 'Marcando…' : 'Marcar resuelto'}
            </button>
          )}
          <button
            type="button"
            onClick={() => onView(ticket.id)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out whitespace-nowrap"
          >
            Ver
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(ticket.id)}
              className="group p-2 sm:p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center"
              title="Editar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(ticket)}
              className="group p-2 sm:p-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center justify-center"
              title="Eliminar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </li>
  );
};
