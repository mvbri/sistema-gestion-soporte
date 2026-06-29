import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import {
  useAdminFrequentIssues,
  useAdminCategorias,
  useDeleteFrequentIssue,
} from '../hooks/useAdmin';
import { EditIcon } from '../components/icons/EditIcon';
import { DeleteIcon } from '../components/icons/DeleteIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { ClearFiltersIcon } from '../components/icons/ClearFiltersIcon';
import type { FrequentIssue } from '../types';
/** Números de página con elipsis si hay muchas páginas. */
function buildDesktopPageList(totalPages: number, current: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const set = new Set([1, totalPages, current, current - 1, current + 1]);
  const sorted = Array.from(set)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  const out: Array<number | 'ellipsis'> = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      out.push('ellipsis');
    }
    out.push(sorted[i]);
  }
  return out;
}

/** Texto de tabla con buen contraste, varias líneas y vista completa al pasar el cursor. */
const IssueTableTextCell: React.FC<{ text: string | null | undefined }> = ({ text }) => {
  const trimmed = text?.trim();
  if (!trimmed) {
    return <span className="text-sm text-gray-400">—</span>;
  }
  return (
    <p
      className="text-[0.9375rem] text-gray-800 leading-6 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl line-clamp-4 break-words"
      title={trimmed}
    >
      {trimmed}
    </p>
  );
};

export const AdminFrequentIssues: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
  const [issueToDelete, setIssueToDelete] = useState<FrequentIssue | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: issues = [], isLoading } = useAdminFrequentIssues();
  const { data: categorias = [] } = useAdminCategorias();
  const deleteMutation = useDeleteFrequentIssue();

  useEffect(() => {
    if (user?.role !== 'administrator') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    setPage(1);
  }, [appliedSearch, activeFilter, categoryFilter]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // MySQL BOOLEAN llega como 0/1; no usar === con true/false del filtro
      const issueActive = Boolean(issue.active);
      if (activeFilter !== undefined && issueActive !== activeFilter) return false;
      if (categoryFilter !== undefined && issue.category_id !== categoryFilter) return false;
      if (!appliedSearch) return true;
      const hay = `${issue.title} ${issue.symptoms || ''} ${issue.possible_solution}`.toLowerCase();
      return hay.includes(appliedSearch);
    });
  }, [issues, activeFilter, categoryFilter, appliedSearch]);

  const tableTotal = filteredIssues.length;
  const tableTotalPages = Math.max(1, Math.ceil(tableTotal / itemsPerPage));

  useEffect(() => {
    if (page > tableTotalPages) {
      setPage(tableTotalPages);
    }
  }, [page, tableTotalPages]);

  const pagedIssues = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredIssues.slice(start, start + itemsPerPage);
  }, [filteredIssues, page, itemsPerPage]);

  const desktopPageList = useMemo(
    () => buildDesktopPageList(tableTotalPages, page),
    [tableTotalPages, page]
  );

  const handleSearch = () => {
    setAppliedSearch(searchTerm.trim().toLowerCase());
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setAppliedSearch('');
    setActiveFilter(undefined);
    setCategoryFilter(undefined);
    setItemsPerPage(10);
    setPage(1);
  };

  const getCategoryName = (categoryId?: number | null) => {
    if (categoryId == null) return '—';
    const c = categorias.find((x) => x.id === categoryId);
    return c?.name || '—';
  };

  const confirmDelete = () => {
    if (!issueToDelete) return;
    deleteMutation.mutate(issueToDelete.id, {
      onSuccess: () => setIssueToDelete(null),
    });
  };

  const activeCount = issues.filter((i) => Boolean(i.active)).length;
  const inactiveCount = issues.length - activeCount;

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="page-heading">Fallas frecuentes</h1>
                <p className="page-subheading max-w-2xl">
                  Plantillas de problemas comunes y posibles soluciones para tickets y formularios.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/frequent-issues/crear')}
                className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Nueva falla</span>
              </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="stat-card stat-card--sky">
                <p className="stat-card-title">Total</p>
                <p className="stat-card-value">{issues.length}</p>
              </div>
              <div className="stat-card stat-card--emerald">
                <p className="stat-card-title">Activas</p>
                <p className="stat-card-value">{activeCount}</p>
              </div>
              <div className="stat-card stat-card--amber">
                <p className="stat-card-title">Inactivas</p>
                <p className="stat-card-value">{inactiveCount}</p>
              </div>
            </div>

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
                  onClick={handleClearFilters}
                  className="btn-secondary flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap"
                  aria-label="Limpiar todos los filtros"
                  title="Limpiar filtros"
                >
                  <ClearFiltersIcon className="w-4 h-4" />
                  <span>Limpiar</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
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
                      onChange={(e) => {
                        const value = e.target.value;
                        setSearchTerm(value);
                        if (value === '') {
                          setAppliedSearch('');
                          setPage(1);
                        }
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Título, síntomas o solución..."
                      className="input-field flex-1 min-w-0 rounded-l-xl rounded-r-none border-r-0"
                    />
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="btn-primary px-5 py-2.5 rounded-l-none rounded-r-xl flex-shrink-0"
                      aria-label="Buscar fallas"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
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
                      value={activeFilter === undefined ? '' : activeFilter ? 'true' : 'false'}
                      onChange={(e) => {
                        const v = e.target.value;
                        setActiveFilter(v === '' ? undefined : v === 'true');
                        setPage(1);
                      }}
                      className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
                    >
                      <option value="">Todas</option>
                      <option value="true">Activas</option>
                      <option value="false">Inactivas</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <span>Categoría</span>
                  </label>
                  <div className="relative">
                    <select
                      value={categoryFilter ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setCategoryFilter(v === '' ? undefined : Number(v));
                        setPage(1);
                      }}
                      className="input-field w-full min-w-0 py-2.5 pr-10 appearance-none cursor-pointer"
                    >
                      <option value="">Todas</option>
                      {categorias.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                          {!c.active ? ' (inactiva)' : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="card py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sky-400 border-t-transparent" />
                <p className="mt-3 text-blue-100/85">Cargando fallas…</p>
              </div>
            ) : issues.length === 0 ? (
              <div className="card py-12 text-center px-4">
                <p className="text-blue-100/80">No hay fallas frecuentes registradas.</p>
                <p className="text-sm text-blue-100/60 mt-2">Crea la primera con el botón «Nueva falla».</p>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="card py-12 text-center px-4">
                <p className="text-blue-100/80">No hay fallas que coincidan con los filtros.</p>
                <p className="text-sm text-blue-100/60 mt-2">Prueba ajustar la búsqueda o el estado.</p>
              </div>
            ) : (
              <>
                <div className="card !p-0 overflow-hidden">
                  <div className="tickets-list-light overflow-x-auto bg-white/95">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Título
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell min-w-[12rem] w-[28%]">
                            Síntomas
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell min-w-[14rem] w-[32%]">
                            Solución
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Categoría
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Activa
                          </th>
                          <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pagedIssues.map((issue) => (
                          <tr key={issue.id} className="hover:bg-gray-50 transition-colors align-top">
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold text-gray-900 max-w-[220px]">
                              {issue.title}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 hidden lg:table-cell align-top">
                              <IssueTableTextCell text={issue.symptoms} />
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 hidden md:table-cell align-top">
                              <IssueTableTextCell text={issue.possible_solution} />
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-gray-700 whitespace-nowrap align-top">
                              {getCategoryName(issue.category_id)}
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm align-top">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                  issue.active
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : 'bg-gray-100 text-gray-700 border-gray-200'
                                }`}
                              >
                                {issue.active ? 'Sí' : 'No'}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-right whitespace-nowrap align-top">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/admin/frequent-issues/${issue.id}/editar`)}
                                  className="btn-warning p-2 sm:p-2.5 flex items-center justify-center"
                                  aria-label="Editar"
                                  title="Editar"
                                >
                                  <EditIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIssueToDelete(issue)}
                                  className="btn-danger p-2 sm:p-2.5 flex items-center justify-center"
                                  aria-label="Eliminar"
                                  title="Eliminar"
                                >
                                  <DeleteIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-3 sm:gap-4">
                    <p className="text-xs sm:text-sm text-blue-50/90 text-center sm:text-left">
                      Mostrando {(page - 1) * itemsPerPage + 1} a {Math.min(page * itemsPerPage, tableTotal)} de{' '}
                      {tableTotal} resultados
                    </p>
                    <label className="flex items-center gap-2 text-xs sm:text-sm text-blue-50/90">
                      <span className="whitespace-nowrap">Por página</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setPage(1);
                        }}
                        className="input-field w-auto min-w-[4.5rem] py-1.5 pl-3 pr-8 text-xs sm:text-sm appearance-none cursor-pointer"
                        aria-label="Resultados por página"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </label>
                  </div>
                  {tableTotalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <div className="hidden sm:flex items-center gap-1">
                        {desktopPageList.map((item, idx) =>
                          item === 'ellipsis' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-blue-100/60 text-sm">
                              …
                            </span>
                          ) : (
                            <button
                              key={item}
                              type="button"
                              onClick={() => setPage(item)}
                              className={`min-w-[2.25rem] px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                item === page
                                  ? 'bg-sky-500/30 text-white ring-1 ring-sky-400/50'
                                  : 'text-blue-100/80 hover:bg-sky-500/15 hover:text-white'
                              }`}
                            >
                              {item}
                            </button>
                          )
                        )}
                      </div>
                      <span className="sm:hidden text-xs text-blue-50/90">
                        Pág. {page} / {tableTotalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPage(Math.min(tableTotalPages, page + 1))}
                        disabled={page === tableTotalPages}
                        className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm disabled:opacity-50"
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {issueToDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div className="card w-full max-w-md !p-6">
                  <h2 className="text-lg font-semibold text-white mb-2">Eliminar falla frecuente</h2>
                  <p className="text-blue-100/85 mb-6">
                    ¿Seguro que deseas eliminar <span className="font-semibold text-white">{issueToDelete.title}</span>?
                    Esta acción no se puede deshacer.
                  </p>
                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <button type="button" onClick={() => setIssueToDelete(null)} className="btn-secondary w-full sm:w-auto">
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={confirmDelete}
                      disabled={deleteMutation.isPending}
                      className="btn-danger w-full sm:w-auto disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? 'Eliminando…' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
