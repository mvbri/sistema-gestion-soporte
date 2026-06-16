import type { TicketFilters, CategoriaTicket, EstadoTicket, PrioridadTicket } from '../../types';
import { ClearFiltersIcon } from '../icons/ClearFiltersIcon';

interface TechnicianOption {
  id: number;
  full_name: string;
}

interface TicketsFiltersPanelProps {
  filters: TicketFilters;
  searchTerm: string;
  estados: EstadoTicket[];
  categorias: CategoriaTicket[];
  prioridades: PrioridadTicket[];
  tecnicos: TechnicianOption[];
  showTechnicianFilter: boolean;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;
  onFilterChange: (key: keyof TicketFilters, value: number | undefined) => void;
  onClearFilters: () => void;
}

export const TicketsFiltersPanel: React.FC<TicketsFiltersPanelProps> = ({
  filters,
  searchTerm,
  estados,
  categorias,
  prioridades,
  tecnicos,
  showTechnicianFilter,
  onSearchTermChange,
  onSearch,
  onFilterChange,
  onClearFilters,
}) => {
  return (
    <div className="content-panel mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-5">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-sky-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <h2 className="text-lg sm:text-xl font-semibold text-white">Filtros de Búsqueda</h2>
        </div>
        <button
          type="button"
          onClick={onClearFilters}
          className="btn-secondary flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap"
          aria-label="Limpiar todos los filtros"
          title="Limpiar filtros"
        >
          <ClearFiltersIcon className="w-4 h-4" />
          <span>Limpiar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-4 sm:mb-5">
        <div className="min-w-0">
          <label className="label-field flex items-center gap-2 !mb-2">
            <svg className="w-4 h-4 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Buscar</span>
          </label>
          <div className="flex min-w-0 shadow-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              placeholder="Título o descripción..."
              className="input-field flex-1 min-w-0 rounded-l-xl rounded-r-none border-r-0"
            />
            <button
              type="button"
              onClick={onSearch}
              className="btn-primary px-5 py-2.5 rounded-l-none rounded-r-xl flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="min-w-0">
          <label className="label-field flex items-center gap-2 !mb-2">
            <svg className="w-4 h-4 text-emerald-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Estado</span>
          </label>
          <div className="relative">
            <select
              value={filters.estado_id || ''}
              onChange={(e) =>
                onFilterChange('estado_id', e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
              className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
            >
              <option value="">Todos</option>
              {estados.map((estado) => (
                <option key={estado.id} value={estado.id}>
                  {estado.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <label className="label-field flex items-center gap-2 !mb-2">
            <svg className="w-4 h-4 text-violet-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>Categoría</span>
          </label>
          <div className="relative">
            <select
              value={filters.categoria_id || ''}
              onChange={(e) =>
                onFilterChange('categoria_id', e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
              className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
            >
              <option value="">Todas</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <label className="label-field flex items-center gap-2 !mb-2">
            <svg className="w-4 h-4 text-amber-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Prioridad</span>
          </label>
          <div className="relative">
            <select
              value={filters.prioridad_id || ''}
              onChange={(e) =>
                onFilterChange('prioridad_id', e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
              className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
            >
              <option value="">Todas</option>
              {prioridades.map((prioridad) => (
                <option key={prioridad.id} value={prioridad.id}>
                  {prioridad.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {showTechnicianFilter && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="min-w-0">
            <label className="label-field flex items-center gap-2 !mb-2">
              <svg className="w-4 h-4 text-indigo-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Técnico Asignado</span>
            </label>
            <div className="relative">
              <select
                value={filters.assigned_technician_id || ''}
                onChange={(e) =>
                  onFilterChange(
                    'assigned_technician_id',
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
                className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
              >
                <option value="">Todos</option>
                {tecnicos.map((tecnico) => (
                  <option key={tecnico.id} value={tecnico.id}>
                    {tecnico.full_name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
