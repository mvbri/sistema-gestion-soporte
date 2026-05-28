import React from 'react';
import type { ToolFilters as ToolFiltersType, ToolStatus } from '../../types';
import { ClearFiltersIcon } from '../icons/ClearFiltersIcon';

interface ToolFiltersProps {
  filters: ToolFiltersType;
  onFilterChange: (key: keyof ToolFiltersType, value: ToolFiltersType[keyof ToolFiltersType]) => void;
  onSearch: () => void;
  onClearFilters: () => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  types: Array<{ value: string; label: string; id?: number }>;
  statuses: Array<{ value: ToolStatus; label: string; color: string }>;
  users?: Array<{ id: number; full_name: string }>;
}

export const ToolFilters: React.FC<ToolFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch,
  onClearFilters,
  searchTerm,
  onSearchTermChange,
  types,
  statuses,
  users,
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
        >
          <ClearFiltersIcon className="w-4 h-4" />
          <span>Limpiar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-4 sm:mb-5">
        <div className="min-w-0">
          <label className="label-field flex items-center gap-2 !mb-2">
            <svg
              className="w-4 h-4 text-sky-300 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span>Buscar</span>
          </label>
          <div className="flex min-w-0 shadow-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              placeholder="Nombre, código, ubicación..."
              className="input-field flex-1 min-w-0 rounded-l-xl rounded-r-none border-r-0"
            />
            <button
              onClick={onSearch}
              className="btn-primary px-5 py-2.5 rounded-l-none rounded-r-xl flex-shrink-0"
              type="button"
              aria-label="Buscar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="min-w-0">
          <label className="label-field flex items-center gap-2 !mb-2">
            <svg
              className="w-4 h-4 text-emerald-300 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Estado</span>
          </label>
          <div className="relative">
            <select
              value={filters.status || ''}
              onChange={(e) => onFilterChange('status', e.target.value || undefined)}
              className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
            >
              <option value="">Todos</option>
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
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
            <svg
              className="w-4 h-4 text-violet-300 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span>Tipo</span>
          </label>
          <div className="relative">
            <select
              value={filters.type || ''}
              onChange={(e) => onFilterChange('type', e.target.value || undefined)}
              className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
            >
              <option value="">Todos</option>
              {types.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
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

        {users && (
          <div className="min-w-0">
            <label className="label-field flex items-center gap-2 !mb-2">
              <svg
                className="w-4 h-4 text-indigo-300 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Asignada a</span>
            </label>
            <div className="relative">
              <select
                value={filters.assigned_to_user_id || ''}
                onChange={(e) =>
                  onFilterChange(
                    'assigned_to_user_id',
                    e.target.value ? parseInt(e.target.value, 10) : undefined,
                  )
                }
                className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
              >
                <option value="">Todas</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name}
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
        )}
      </div>
    </div>
  );
};

