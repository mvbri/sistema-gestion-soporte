import type { TicketListTab } from '../../types';
import { TICKET_TAB_LABELS } from '../../utils/ticketListTabs';

interface TicketsTabBarProps {
  activeTab: TicketListTab;
  visibleTabs: TicketListTab[];
  onTabChange: (tab: TicketListTab) => void;
}

export const TicketsTabBar: React.FC<TicketsTabBarProps> = ({
  activeTab,
  visibleTabs,
  onTabChange,
}) => {
  if (visibleTabs.length === 0) {
    return null;
  }

  return (
    <div
      className="mb-6 flex flex-wrap gap-2 border-b border-sky-400/25 pb-1"
      role="tablist"
      aria-label="Pestañas de tickets"
    >
      {visibleTabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-xl transition-colors ${
              isActive
                ? 'bg-sky-500/25 text-white border-b-2 border-sky-400'
                : 'text-blue-100/70 hover:text-white hover:bg-sky-500/10'
            }`}
          >
            {TICKET_TAB_LABELS[tab]}
          </button>
        );
      })}
    </div>
  );
};
