import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import {
  useAdminFrequentIssues,
  useAdminCategorias,
  useCreateFrequentIssue,
  useUpdateFrequentIssue,
  useDeleteFrequentIssue,
} from '../hooks/useAdmin';
import { EditIcon } from '../components/icons/EditIcon';
import { DeleteIcon } from '../components/icons/DeleteIcon';
import { PlusIcon } from '../components/icons/PlusIcon';
import { FrequentIssueIcon } from '../components/icons/FrequentIssueIcon';
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingIssue, setEditingIssue] = useState<FrequentIssue | null>(null);
  const [issueToDelete, setIssueToDelete] = useState<FrequentIssue | null>(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: issues = [], isLoading } = useAdminFrequentIssues();
  const { data: categorias = [] } = useAdminCategorias();
  const createMutation = useCreateFrequentIssue();
  const updateMutation = useUpdateFrequentIssue();
  const deleteMutation = useDeleteFrequentIssue();

  useEffect(() => {
    if (user?.role !== 'administrator') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim().toLowerCase()), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeFilter]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // MySQL BOOLEAN llega como 0/1; no usar === con true/false del filtro
      const issueActive = Boolean(issue.active);
      if (activeFilter !== undefined && issueActive !== activeFilter) return false;
      if (!debouncedSearch) return true;
      const hay = `${issue.title} ${issue.symptoms || ''} ${issue.possible_solution}`.toLowerCase();
      return hay.includes(debouncedSearch);
    });
  }, [issues, activeFilter, debouncedSearch]);

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

  const filtersAreDefault =
    !searchTerm.trim() && activeFilter === undefined && itemsPerPage === 10 && page === 1;

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setActiveFilter(undefined);
    setItemsPerPage(10);
    setPage(1);
  };

  const getCategoryName = (categoryId?: number | null) => {
    if (categoryId == null) return '—';
    const c = categorias.find((x) => x.id === categoryId);
    return c?.name || '—';
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = (fd.get('title') as string).trim();
    const possible_solution = (fd.get('possible_solution') as string).trim();
    const symptoms = (fd.get('symptoms') as string)?.trim() || undefined;
    const cat = fd.get('category_id') as string;
    const category_id = cat && cat !== '' ? Number(cat) : null;
    const active = fd.get('active') === 'on';

    createMutation.mutate(
      { title, possible_solution, symptoms, category_id, active },
      {
        onSuccess: () => {
          setShowCreateForm(false);
          form.reset();
        },
      }
    );
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingIssue) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = (fd.get('title') as string).trim();
    const possible_solution = (fd.get('possible_solution') as string).trim();
    const symptoms = (fd.get('symptoms') as string)?.trim() || '';
    const cat = fd.get('category_id') as string;
    const category_id = cat && cat !== '' ? Number(cat) : null;
    const active = fd.get('active') === 'on';

    updateMutation.mutate(
      {
        id: editingIssue.id,
        data: { title, possible_solution, symptoms, category_id, active },
      },
      {
        onSuccess: () => setEditingIssue(null),
      }
    );
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
              <div>
                <h1 className="mb-2 flex flex-wrap items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
                  <FrequentIssueIcon className="h-8 w-8 shrink-0 text-blue-600 sm:h-9 sm:w-9" />
                  Fallas frecuentes
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Plantillas de problemas comunes y posibles soluciones para tickets y formularios.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateForm(true)}
                className="btn-primary flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto"
              >
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Nueva falla</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                <p className="text-slate-200 text-xs sm:text-sm font-medium mb-1">Total</p>
                <p className="text-2xl sm:text-3xl font-bold">{issues.length}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                <p className="text-emerald-100 text-xs sm:text-sm font-medium mb-1">Activas</p>
                <p className="text-2xl sm:text-3xl font-bold">{activeCount}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                <p className="text-amber-100 text-xs sm:text-sm font-medium mb-1">Inactivas</p>
                <p className="text-2xl sm:text-3xl font-bold">{inactiveCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-4 sm:mb-6 p-3 sm:p-4">
            <div className="mb-2 flex items-center justify-between gap-3 sm:mb-3">
              <h2 className="text-sm font-semibold text-gray-800 sm:text-base">Filtros</h2>
              <button
                type="button"
                onClick={handleClearFilters}
                disabled={filtersAreDefault}
                title="Limpiar filtros"
                aria-label="Limpiar filtros"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
              >
                <ClearFiltersIcon />
              </button>
            </div>
            <div className="flex flex-col gap-2 sm:gap-3 md:flex-row md:flex-wrap md:items-end md:gap-3">
              <div className="min-w-0 w-full md:w-80 md:shrink-0">
                <label className="mb-1 block text-xs font-medium text-gray-600 sm:text-sm sm:font-semibold sm:text-gray-700">
                  Buscar
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Título, síntomas o solución..."
                    className="input-field w-full py-1.5 pl-9 pr-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <svg
                    className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
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
                </div>
              </div>
              <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3 md:contents">
                <div className="min-w-0 w-full md:w-48 md:shrink-0">
                  <label className="mb-1 block text-xs font-medium text-gray-600 sm:text-sm sm:font-semibold sm:text-gray-700">
                    Estado
                  </label>
                  <select
                    value={activeFilter === undefined ? '' : activeFilter ? 'true' : 'false'}
                    onChange={(e) => {
                      const v = e.target.value;
                      setActiveFilter(v === '' ? undefined : v === 'true');
                    }}
                    className="input-field w-full px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Todas</option>
                    <option value="true">Solo activas</option>
                    <option value="false">Solo inactivas</option>
                  </select>
                </div>
                <div className="min-w-0 w-full md:w-48 md:shrink-0">
                  <label className="mb-1 block text-xs font-medium text-gray-600 sm:text-sm sm:font-semibold sm:text-gray-700">
                    <span className="md:hidden">Filas por página</span>
                    <span className="hidden md:inline">Por página</span>
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    className="input-field w-full px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      Título
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide hidden lg:table-cell min-w-[12rem] w-[28%]">
                      Síntomas
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide hidden md:table-cell min-w-[14rem] w-[32%]">
                      Solución
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap">
                      Categoría
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap">
                      Activa
                    </th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide whitespace-nowrap">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        Cargando…
                      </td>
                    </tr>
                  ) : filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No hay fallas que coincidan con los filtros.
                      </td>
                    </tr>
                  ) : (
                    pagedIssues.map((issue) => (
                      <tr key={issue.id} className="hover:bg-slate-50/80 border-b border-gray-100 last:border-0 align-top">
                        <td className="px-4 py-4 text-sm font-semibold text-gray-900 max-w-[220px]">
                          {issue.title}
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell align-top">
                          <IssueTableTextCell text={issue.symptoms} />
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell align-top">
                          <IssueTableTextCell text={issue.possible_solution} />
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap align-top">
                          {getCategoryName(issue.category_id)}
                        </td>
                        <td className="px-4 py-4 text-sm align-top">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                              issue.active ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {issue.active ? 'Sí' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-right whitespace-nowrap align-top">
                          <button
                            type="button"
                            onClick={() => setEditingIssue(issue)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-1"
                            aria-label="Editar"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setIssueToDelete(issue)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            aria-label="Eliminar"
                          >
                            <DeleteIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {tableTotalPages > 1 && (
              <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 gap-3 sm:gap-0">
                <div className="flex-1 flex flex-col gap-2 sm:hidden w-full">
                  <p className="text-center text-xs text-gray-600">
                    Página {page} de {tableTotalPages}
                  </p>
                  <div className="flex justify-between w-full">
                    <button
                      type="button"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => setPage(Math.min(tableTotalPages, page + 1))}
                      disabled={page === tableTotalPages}
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between w-full">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-700">
                      Mostrando <span className="font-semibold">{(page - 1) * itemsPerPage + 1}</span> a{' '}
                      <span className="font-semibold">{Math.min(page * itemsPerPage, tableTotal)}</span> de{' '}
                      <span className="font-semibold">{tableTotal}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Paginación">
                      <button
                        type="button"
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      {desktopPageList.map((item, idx) =>
                        item === 'ellipsis' ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm text-gray-500"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setPage(item)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                              item === page
                                ? 'z-10 bg-primary-600 border-primary-600 text-white'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}
                      <button
                        type="button"
                        onClick={() => setPage(Math.min(tableTotalPages, page + 1))}
                        disabled={page === tableTotalPages}
                        className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>

          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Nueva falla frecuente</h2>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                      aria-label="Cerrar"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                      <input name="title" required className="input-field w-full" placeholder="Ej. Sin conexión a internet" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Síntomas</label>
                      <textarea
                        name="symptoms"
                        rows={3}
                        className="input-field w-full"
                        placeholder="Descripción breve de lo que observa el usuario"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Posible solución *</label>
                      <textarea
                        name="possible_solution"
                        required
                        rows={4}
                        className="input-field w-full"
                        placeholder="Pasos sugeridos para resolver o escalar"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría de ticket</label>
                      <select name="category_id" className="input-field w-full" defaultValue="">
                        <option value="">Sin categoría</option>
                        {categorias.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                            {!c.active ? ' (inactiva)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" name="active" id="create-active" defaultChecked className="rounded border-gray-300" />
                      <label htmlFor="create-active" className="text-sm text-gray-700">
                        Visible en formularios (activa)
                      </label>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary px-4 py-2">
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="btn-primary px-4 py-2 disabled:opacity-50"
                      >
                        {createMutation.isPending ? 'Guardando…' : 'Crear'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {editingIssue && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Editar falla frecuente</h2>
                    <button
                      type="button"
                      onClick={() => setEditingIssue(null)}
                      className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                      aria-label="Cerrar"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleUpdate} className="space-y-4" key={editingIssue.id}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                      <input
                        name="title"
                        required
                        defaultValue={editingIssue.title}
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Síntomas</label>
                      <textarea
                        name="symptoms"
                        rows={3}
                        defaultValue={editingIssue.symptoms || ''}
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Posible solución *</label>
                      <textarea
                        name="possible_solution"
                        required
                        rows={4}
                        defaultValue={editingIssue.possible_solution}
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría de ticket</label>
                      <select
                        name="category_id"
                        className="input-field w-full"
                        defaultValue={editingIssue.category_id ?? ''}
                      >
                        <option value="">Sin categoría</option>
                        {categorias.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                            {!c.active ? ' (inactiva)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="active"
                        id="edit-active"
                        defaultChecked={editingIssue.active}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="edit-active" className="text-sm text-gray-700">
                        Visible en formularios (activa)
                      </label>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setEditingIssue(null)} className="btn-secondary px-4 py-2">
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="btn-primary px-4 py-2 disabled:opacity-50"
                      >
                        {updateMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {issueToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Eliminar falla frecuente</h2>
                <p className="text-gray-600 mb-6">
                  ¿Seguro que deseas eliminar <span className="font-semibold">{issueToDelete.title}</span>? Esta acción no se puede deshacer.
                </p>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <button type="button" onClick={() => setIssueToDelete(null)} className="btn-secondary px-4 py-2">
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={deleteMutation.isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? 'Eliminando…' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
};
