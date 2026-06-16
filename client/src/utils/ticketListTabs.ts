import type { TicketFilters, TicketListTab } from '../types';

type UserRole = 'administrator' | 'technician' | 'end_user' | string | undefined;

const VALID_TABS: TicketListTab[] = ['assigned', 'created', 'all'];

/**
 * Pestaña por defecto según rol del usuario.
 */
export const getDefaultTicketTab = (role: UserRole): TicketListTab => {
  if (role === 'technician') return 'assigned';
  if (role === 'administrator') return 'all';
  return 'assigned';
};

/**
 * Valida la pestaña de la URL según el rol; devuelve la pestaña efectiva.
 */
export const resolveTicketTab = (tabParam: string | null, role: UserRole): TicketListTab => {
  const defaultTab = getDefaultTicketTab(role);

  if (!tabParam || !VALID_TABS.includes(tabParam as TicketListTab)) {
    return defaultTab;
  }

  const tab = tabParam as TicketListTab;

  if (role === 'technician' && tab === 'all') {
    return 'assigned';
  }

  if (role === 'end_user') {
    return defaultTab;
  }

  return tab;
};

/**
 * Pestañas visibles según rol.
 */
export const getVisibleTicketTabs = (role: UserRole): TicketListTab[] => {
  if (role === 'administrator') {
    return ['assigned', 'created', 'all'];
  }
  if (role === 'technician') {
    return ['assigned', 'created'];
  }
  return [];
};

/**
 * Construye filtros API a partir de la pestaña activa y filtros locales de UI.
 */
export const buildTicketFilters = (
  tab: TicketListTab,
  userId: number | undefined,
  role: UserRole,
  localFilters: TicketFilters
): TicketFilters => {
  const { scope: _scope, assigned_technician_id: _assigned, ...rest } = localFilters;

  if (role === 'end_user') {
    return { ...rest, page: rest.page ?? 1, limit: rest.limit ?? 10 };
  }

  if (tab === 'created') {
    return {
      ...rest,
      scope: 'created_by_me',
      page: rest.page ?? 1,
      limit: rest.limit ?? 10,
    };
  }

  if (tab === 'assigned') {
    if (role === 'administrator' && userId) {
      return {
        ...rest,
        assigned_technician_id: userId,
        page: rest.page ?? 1,
        limit: rest.limit ?? 10,
      };
    }
    return { ...rest, page: rest.page ?? 1, limit: rest.limit ?? 10 };
  }

  return { ...rest, page: rest.page ?? 1, limit: rest.limit ?? 10 };
};

export const TICKET_TAB_LABELS: Record<TicketListTab, string> = {
  assigned: 'Asignados a mí',
  created: 'Creados por mí',
  all: 'Todos',
};
