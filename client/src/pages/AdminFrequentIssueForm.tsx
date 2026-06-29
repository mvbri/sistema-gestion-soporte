import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import {
  useAdminCategorias,
  useAdminFrequentIssues,
  useCreateFrequentIssue,
  useUpdateFrequentIssue,
} from '../hooks/useAdmin';
import formStyles from '../styles/modules/forms.module.css';

const LIST_PATH = '/admin/frequent-issues';

export const AdminFrequentIssueForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  const issueId = id ? Number(id) : null;

  const { data: issues = [], isLoading: isLoadingIssues } = useAdminFrequentIssues();
  const { data: categorias = [] } = useAdminCategorias();
  const createMutation = useCreateFrequentIssue();
  const updateMutation = useUpdateFrequentIssue();

  const editingIssue =
    isEditing && issueId != null && !Number.isNaN(issueId)
      ? issues.find((issue) => issue.id === issueId)
      : undefined;

  useEffect(() => {
    if (user?.role !== 'administrator') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = (fd.get('title') as string).trim();
    const possible_solution = (fd.get('possible_solution') as string).trim();
    const symptoms = (fd.get('symptoms') as string)?.trim() || undefined;
    const cat = fd.get('category_id') as string;
    const category_id = cat && cat !== '' ? Number(cat) : null;
    const active = fd.get('active') === 'on';

    if (isEditing && editingIssue) {
      updateMutation.mutate(
        {
          id: editingIssue.id,
          data: {
            title,
            possible_solution,
            symptoms: symptoms ?? '',
            category_id,
            active,
          },
        },
        {
          onSuccess: () => navigate(LIST_PATH),
        }
      );
      return;
    }

    createMutation.mutate(
      { title, possible_solution, symptoms, category_id, active },
      {
        onSuccess: () => navigate(LIST_PATH),
      }
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (user?.role !== 'administrator') {
    return null;
  }

  if (isEditing && isLoadingIssues) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="max-w-2xl mx-auto py-12 px-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-sky-400 border-t-transparent" />
            <p className="mt-3 text-blue-100/85">Cargando falla…</p>
          </div>
        </PageWrapper>
      </>
    );
  }

  if (isEditing && !editingIssue) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="card text-center py-12">
              <p className="text-blue-100/90 font-medium">Falla frecuente no encontrada</p>
              <p className="text-sm text-blue-100/60 mt-2">
                La falla que buscas no existe o ha sido eliminada.
              </p>
              <button type="button" onClick={() => navigate(LIST_PATH)} className="btn-primary mt-6">
                Volver a fallas frecuentes
              </button>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-2xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate(LIST_PATH)}
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-200/90 hover:text-white transition-colors mb-6"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a fallas frecuentes
          </button>

          <div className="card !p-5 sm:!p-8">
            <header className="mb-6">
              <h1 className="page-heading">
                {isEditing ? 'Editar falla frecuente' : 'Nueva falla frecuente'}
              </h1>
              <p className="page-subheading mt-2">
                {isEditing
                  ? 'Modifica los datos de la plantilla de problema frecuente.'
                  : 'Registra una plantilla de problema común y su posible solución.'}
              </p>
            </header>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              key={editingIssue?.id ?? 'create'}
            >
              <div className={formStyles.formGroup}>
                <label className="label-field">
                  Título
                  <span className="text-red-300/90" aria-hidden>
                    {' '}
                    *
                  </span>
                </label>
                <input
                  name="title"
                  required
                  defaultValue={editingIssue?.title ?? ''}
                  className="input-dark"
                  placeholder="Ej. Sin conexión a internet"
                />
              </div>
              <div className={formStyles.formGroup}>
                <label className="label-field">Síntomas</label>
                <textarea
                  name="symptoms"
                  rows={3}
                  defaultValue={editingIssue?.symptoms || ''}
                  className="input-dark"
                  placeholder="Descripción breve de lo que observa el usuario"
                />
              </div>
              <div className={formStyles.formGroup}>
                <label className="label-field">
                  Posible solución
                  <span className="text-red-300/90" aria-hidden>
                    {' '}
                    *
                  </span>
                </label>
                <textarea
                  name="possible_solution"
                  required
                  rows={4}
                  defaultValue={editingIssue?.possible_solution ?? ''}
                  className="input-dark"
                  placeholder="Pasos sugeridos para resolver o escalar"
                />
              </div>
              <div className={formStyles.formGroup}>
                <label className="label-field">Categoría de ticket</label>
                <select
                  name="category_id"
                  className={`input-dark ${formStyles.selectField}`}
                  defaultValue={editingIssue?.category_id ?? ''}
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
                  id="issue-active"
                  defaultChecked={editingIssue?.active ?? true}
                  className="rounded border-sky-400/40 bg-slate-900/80 text-sky-500"
                />
                <label htmlFor="issue-active" className="text-sm text-blue-100/85">
                  Visible en formularios (activa)
                </label>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(LIST_PATH)}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary w-full sm:w-auto disabled:opacity-50"
                >
                  {isPending
                    ? 'Guardando…'
                    : isEditing
                      ? 'Guardar cambios'
                      : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
