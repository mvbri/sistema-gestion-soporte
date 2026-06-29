import type { TicketLifecycleMetrics } from '../../types';

interface TicketLifecycleSummaryCardsProps {
  metrics: Pick<
    TicketLifecycleMetrics,
    | 'tickets_creados'
    | 'tickets_resueltos'
    | 'tickets_cerrados'
    | 'promedio_horas_hasta_resolucion'
    | 'promedio_horas_hasta_cierre'
  >;
  period?: {
    date_from: string;
    date_to: string;
  };
  showPeriod?: boolean;
}

function formatHours(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }
  return `${value} h`;
}

export const TicketLifecycleSummaryCards: React.FC<TicketLifecycleSummaryCardsProps> = ({
  metrics,
  period,
  showPeriod = true,
}) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
    <div className="stat-card stat-card--sky">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="stat-card-title">Tickets creados</p>
          <p className="stat-card-value">{metrics.tickets_creados}</p>
          <p className="stat-card-hint">En el período (fecha de creación)</p>
        </div>
        <div className="stat-card-icon stat-card-icon--sky">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
    </div>

    <div className="stat-card stat-card--emerald">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="stat-card-title">Tickets resueltos</p>
          <p className="stat-card-value">{metrics.tickets_resueltos}</p>
          <p className="stat-card-hint">Marcados resueltos en el período</p>
        </div>
        <div className="stat-card-icon stat-card-icon--emerald">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>

    <div className="stat-card stat-card--slate">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="stat-card-title">Cierres del período</p>
          <p className="stat-card-value">{metrics.tickets_cerrados}</p>
          <p className="stat-card-hint">Por fecha de cierre definitivo</p>
        </div>
        <div className="stat-card-icon stat-card-icon--slate">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </div>

    <div className="stat-card stat-card--emerald">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="stat-card-title">Tiempo hasta resolución</p>
          <p className="stat-card-value">{formatHours(metrics.promedio_horas_hasta_resolucion)}</p>
          <p className="stat-card-hint">Creación → marcar resuelto</p>
        </div>
        <div className="stat-card-icon stat-card-icon--emerald">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>

    <div className="stat-card stat-card--slate">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="stat-card-title">Tiempo hasta cierre</p>
          <p className="stat-card-value">{formatHours(metrics.promedio_horas_hasta_cierre)}</p>
          <p className="stat-card-hint">Creación → cierre definitivo</p>
        </div>
        <div className="stat-card-icon stat-card-icon--slate">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </div>

    {showPeriod && period && (
      <div className="stat-card stat-card--sky">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="stat-card-title">Período</p>
            <p className="stat-card-value text-base sm:text-lg font-semibold leading-snug">
              {period.date_from}
              <span className="mx-1.5 opacity-60">→</span>
              {period.date_to}
            </p>
          </div>
          <div className="stat-card-icon stat-card-icon--sky">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>
    )}
  </div>
);
