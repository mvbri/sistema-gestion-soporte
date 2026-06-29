import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import {
  useTickets,
  useEstados,
  useCategorias,
  usePrioridades,
  useTecnicos,
  useDeleteTicket,
  useMarkAsResolved,
  useStartProgress,
} from '../hooks/useTickets';
import type { Ticket, TicketFilters, TicketListTab } from '../types';
import { ConfirmDeleteModal } from '../components/tickets/ConfirmDeleteModal';
import { TicketsTabBar } from '../components/tickets/TicketsTabBar';
import { TicketAssignedStats } from '../components/tickets/TicketAssignedStats';
import { TicketsFiltersPanel } from '../components/tickets/TicketsFiltersPanel';
import { TicketListItem } from '../components/tickets/TicketListItem';
import {
  buildTicketFilters,
  getDefaultTicketTab,
  getVisibleTicketTabs,
  resolveTicketTab,
} from '../utils/ticketListTabs';

const INITIAL_FILTERS: TicketFilters = {
  page: 1,
  limit: 10,
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';

  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TicketsList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const role = user?.role;
  const visibleTabs = getVisibleTicketTabs(role);
  const hasTabs = visibleTabs.length > 0;

  const tabParam = searchParams.get('tab');
  const activeTab = hasTabs ? resolveTicketTab(tabParam, role) : getDefaultTicketTab(role);

  const [localFilters, setLocalFilters] = useState<TicketFilters>(INITIAL_FILTERS);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; ticket: Ticket | null }>({
    isOpen: false,
    ticket: null,
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!hasTabs) return;

    const resolved = resolveTicketTab(tabParam, role);
    if (tabParam !== resolved) {
      setSearchParams({ tab: resolved }, { replace: true });
    }
  }, [hasTabs, tabParam, role, setSearchParams]);

  const apiFilters = useMemo(
    () => buildTicketFilters(activeTab, user?.id, role, localFilters),
    [activeTab, user?.id, role, localFilters]
  );

  const statsFilters = useMemo(
    () =>
      buildTicketFilters('assigned', user?.id, role, { page: 1, limit: 1000 }),
    [user?.id, role]
  );

  const { data: ticketsData, isLoading: loadingTickets } = useTickets(apiFilters);
  const { data: statsData } = useTickets(statsFilters, {
    enabled: hasTabs && activeTab === 'assigned',
  });

  const { data: estados = [] } = useEstados();
  const { data: categorias = [] } = useCategorias();
  const { data: prioridades = [] } = usePrioridades();
  const { data: tecnicos = [] } = useTecnicos();
  const deleteTicketMutation = useDeleteTicket();
  const markAsResolvedMutation = useMarkAsResolved();
  const startProgressMutation = useStartProgress();

  const tickets = ticketsData?.tickets || [];
  const statsTickets = statsData?.tickets || [];
  const pagination = ticketsData?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  const canCreateTicket =
    role === 'end_user' || role === 'technician' || role === 'administrator';

  const handleTabChange = (tab: TicketListTab) => {
    setLocalFilters(INITIAL_FILTERS);
    setSearchTerm('');
    setSearchParams({ tab });
  };

  const handleFilterChange = (key: keyof TicketFilters, value: number | undefined) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = () => {
    setLocalFilters((prev) => ({ ...prev, busqueda: searchTerm || undefined, page: 1 }));
  };

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    if (value === '') {
      setLocalFilters((prev) => ({ ...prev, busqueda: undefined, page: 1 }));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setLocalFilters(INITIAL_FILTERS);
  };

  const handleDelete = async () => {
    if (!deleteModal.ticket) return;
    deleteTicketMutation.mutate(deleteModal.ticket.id, {
      onSuccess: () => {
        setDeleteModal({ isOpen: false, ticket: null });
      },
    });
  };

  const getPageTitle = () => {
    if (role === 'end_user') return 'Mis tickets';
    if (role === 'administrator' && activeTab === 'all') return 'Gestión de tickets';
    return 'Panel de tickets';
  };

  const getPageSubtitle = () => {
    if (role === 'end_user') return 'Solo puedes ver tus propios tickets';
    if (activeTab === 'assigned') return 'Tickets asignados a ti para gestionar y resolver.';
    if (activeTab === 'created') return 'Tickets que creaste como solicitante.';
    if (activeTab === 'all') return 'Listado global de todos los tickets del sistema.';
    return undefined;
  };

  const getEmptyMessage = () => {
    if (activeTab === 'assigned') return 'No tienes tickets asignados con estos filtros.';
    if (activeTab === 'created') return 'No has creado tickets con estos filtros.';
    return 'No se encontraron tickets';
  };

  const canEdit = role === 'administrator' && activeTab === 'all';
  const canDelete = role === 'administrator' && activeTab === 'all';
  const showTechnicianFilter = role === 'administrator' && activeTab === 'all';

  const isMarkingResolved = (ticketId: string) =>
    markAsResolvedMutation.isPending && markAsResolvedMutation.variables === ticketId;

  const isStartingProgress = (ticketId: string) =>
    startProgressMutation.isPending && startProgressMutation.variables === ticketId;

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="page-heading">{getPageTitle()}</h1>
                {getPageSubtitle() && <p className="page-subheading">{getPageSubtitle()}</p>}
              </div>
              {canCreateTicket && (
                <button
                  type="button"
                  onClick={() => navigate('/tickets/crear')}
                  className="btn-primary text-sm sm:text-base whitespace-nowrap"
                >
                  Crear Ticket
                </button>
              )}
            </div>

            {hasTabs && (
              <TicketsTabBar
                activeTab={activeTab}
                visibleTabs={visibleTabs}
                onTabChange={handleTabChange}
              />
            )}

            {hasTabs && activeTab === 'assigned' && (
              <TicketAssignedStats tickets={statsTickets} />
            )}

            <TicketsFiltersPanel
              filters={localFilters}
              searchTerm={searchTerm}
              estados={estados}
              categorias={categorias}
              prioridades={prioridades}
              tecnicos={tecnicos}
              showTechnicianFilter={showTechnicianFilter}
              onSearchTermChange={handleSearchTermChange}
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />

            {loadingTickets ? (
              <div className="card py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sky-400 border-t-transparent" />
                <p className="mt-3 text-blue-100/85">Cargando tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="card py-12 text-center">
                <p className="text-blue-100/80">{getEmptyMessage()}</p>
              </div>
            ) : (
              <>
                <div className="card !p-0 overflow-hidden border-sky-300/25 ring-2 ring-sky-400/25 shadow-2xl shadow-sky-950/50">
                  <ul className="space-y-2 bg-slate-950/55 p-2 sm:p-3">
                    {tickets.map((ticket) => (
                      <TicketListItem
                        key={ticket.id}
                        ticket={ticket}
                        activeTab={activeTab}
                        userId={user?.id}
                        userRole={role}
                        formatDate={formatDate}
                        onView={(id) => navigate(`/tickets/${id}`)}
                        onEdit={canEdit ? (id) => navigate(`/tickets/${id}/editar`) : undefined}
                        onDelete={canDelete ? (t) => setDeleteModal({ isOpen: true, ticket: t }) : undefined}
                        onStartProgress={(id) => startProgressMutation.mutate(id)}
                        onMarkResolved={(id) => markAsResolvedMutation.mutate(id)}
                        isStartingProgress={isStartingProgress(ticket.id)}
                        isMarkingResolved={isMarkingResolved(ticket.id)}
                      />
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs sm:text-sm text-blue-50/90 text-center sm:text-left">
                    Mostrando {(pagination.page - 1) * pagination.limit + 1} a{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                    {pagination.total} tickets
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setLocalFilters((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))
                      }
                      disabled={pagination.page === 1}
                      className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setLocalFilters((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))
                      }
                      disabled={pagination.page >= pagination.totalPages}
                      className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <ConfirmDeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, ticket: null })}
          onConfirm={handleDelete}
          ticketTitulo={deleteModal.ticket?.title || ''}
        />
      </PageWrapper>
    </>
  );
};
