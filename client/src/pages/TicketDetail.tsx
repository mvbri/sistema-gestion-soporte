import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import { MainNavbar } from '../components/MainNavbar';
import { PageWrapper } from '../components/PageWrapper';
import { 
  useTicket, 
  useEstados, 
  useTecnicos, 
  useFrequentIssues,
  useUpdateTicket, 
  useAddComment, 
  useStartProgress, 
  useMarkAsResolved 
} from '../hooks/useTickets';
import { useEquipment } from '../hooks/useEquipment';
import { updateTicketSchema, commentSchema, type UpdateTicketData, type CommentData } from '../schemas/ticketSchemas';
import { StatusBadge } from '../components/tickets/StatusBadge';
import { PriorityBadge } from '../components/tickets/PriorityBadge';
import { CategoryBadge } from '../components/tickets/CategoryBadge';
import { translateRole } from '../utils/roleTranslations';
import { FrequentIssueIcon } from '../components/icons/FrequentIssueIcon';
import type { EquipmentFilters } from '../types';
import formStyles from '../styles/modules/forms.module.css';

const FREQUENT_ISSUE_COMMENT_BLOCK_START = 'Diagnóstico sugerido:';

/** Quita del comentario los bloques insertados desde el desplegable de fallas frecuentes (evita duplicar al cambiar de opción). */
function stripFrequentIssueCommentTemplates(text: string): string {
  return text
    .split(/\n\s*\n+/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0 && !block.startsWith(FREQUENT_ISSUE_COMMENT_BLOCK_START))
    .join('\n\n')
    .trim();
}

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const { data: ticketData, isLoading: loadingTicket } = useTicket(id);
  const { data: estados = [] } = useEstados();
  const { data: tecnicos = [] } = useTecnicos();
  const showFrequentIssueCommentTemplates = user?.role !== 'end_user';
  const { data: frequentIssues = [] } = useFrequentIssues({
    enabled: showFrequentIssueCommentTemplates,
  });
  const equipmentFilters: EquipmentFilters = {
    limit: 1000,
    ...(user?.role !== 'administrator' ? { for_tickets: true } : {}),
  };
  const { data: equipmentData } = useEquipment(equipmentFilters);
  const equipos = equipmentData?.equipment || [];
  
  const updateTicketMutation = useUpdateTicket();
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<number[]>([]);
  const addCommentMutation = useAddComment();
  const startProgressMutation = useStartProgress();
  const markAsResolvedMutation = useMarkAsResolved();

  const ticket = ticketData?.ticket;
  const comentarios = ticketData?.comentarios || [];
  const historial = (ticketData?.historial || []).sort((a, b) => {
    const dateA = new Date(a.changed_at || 0).getTime();
    const dateB = new Date(b.changed_at || 0).getTime();
    return dateB - dateA;
  });

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: errorsUpdate },
    reset: resetUpdate,
    control: controlUpdate,
    watch: watchUpdate,
    setValue: setValueUpdate,
  } = useForm<UpdateTicketData>({
    resolver: zodResolver(updateTicketSchema),
  });

  const {
    register: registerComment,
    handleSubmit: handleSubmitComment,
    formState: { errors: errorsComment },
    reset: resetComment,
    setValue: setCommentValue,
    getValues: getCommentValues,
  } = useForm<CommentData>({
    resolver: zodResolver(commentSchema),
  });

  useEffect(() => {
    if (ticket) {
      const isAssignedTechnician = user?.role === 'technician' && ticket.assigned_technician_id === user?.id;
      let defaultEstadoId = ticket.state_id;
      
      if (ticket.assigned_technician_id && ticket.state_id === 1) {
        defaultEstadoId = 2;
      } else if (isAssignedTechnician && ticket.state_id === 1) {
        defaultEstadoId = 2;
      }
      
      resetUpdate({
        titulo: ticket.title,
        descripcion: ticket.description,
        categoria_id: ticket.category_id,
        prioridad_id: ticket.priority_id,
        estado_id: defaultEstadoId,
        tecnico_asignado_id: ticket.assigned_technician_id || null,
        equipment_ids: ticket.equipment?.map(eq => eq.id) || [],
      });
      
      setSelectedEquipmentIds(ticket.equipment?.map(eq => eq.id) || []);

      if (location.pathname.includes('/editar')) {
        if (user?.role === 'administrator' || isAssignedTechnician) {
          setIsEditing(true);
        }
      }
    }
  }, [ticket, resetUpdate, user, location.pathname]);

  const tecnicoAsignadoId = watchUpdate('tecnico_asignado_id');
  const estadoIdActual = watchUpdate('estado_id');

  useEffect(() => {
    if (user?.role === 'administrator' && isEditing && ticket) {
      const estadoIdForm = estadoIdActual || ticket.state_id;
      const tecnicoAnterior = ticket.assigned_technician_id;
      
      if (tecnicoAsignadoId && !tecnicoAnterior && estadoIdForm === 1) {
        setValueUpdate('estado_id', 2, { shouldValidate: true });
      } else if (tecnicoAsignadoId && tecnicoAsignadoId !== tecnicoAnterior && estadoIdForm === 1) {
        setValueUpdate('estado_id', 2, { shouldValidate: true });
      }
    }
  }, [tecnicoAsignadoId, ticket, estados, user, isEditing, setValueUpdate, estadoIdActual]);

  const onUpdate = (data: UpdateTicketData) => {
    if (!id) return;
    
    console.log('Datos del formulario:', data);
    console.log('tecnico_asignado_id:', data.tecnico_asignado_id, typeof data.tecnico_asignado_id);
    
    const isAssignedTechnician = user?.role === 'technician' && ticket?.assigned_technician_id === user?.id;
    
    if (isAssignedTechnician) {
      const estadoId = data.estado_id !== undefined && data.estado_id !== null 
        ? Number(data.estado_id)
        : ticket?.state_id 
          ? Number(ticket.state_id)
          : undefined;
      
      if (!estadoId || isNaN(estadoId)) {
        return;
      }
      
      const dataToSend = { estado_id: estadoId };
      updateTicketMutation.mutate(
        { id, data: dataToSend as UpdateTicketData },
        {
          onSuccess: () => {
            setIsEditing(false);
            if (location.pathname.includes('/editar')) {
              navigate(`/tickets/${id}`);
            }
          },
        }
      );
    } else {
      const dataToSend: UpdateTicketData = {};
      
      if (data.titulo !== undefined) dataToSend.titulo = data.titulo;
      if (data.descripcion !== undefined) dataToSend.descripcion = data.descripcion;
      if (data.categoria_id !== undefined) dataToSend.categoria_id = data.categoria_id;
      if (data.prioridad_id !== undefined) dataToSend.prioridad_id = data.prioridad_id;
      if (data.estado_id !== undefined) dataToSend.estado_id = data.estado_id;
      
      if (data.tecnico_asignado_id !== undefined) {
        dataToSend.tecnico_asignado_id = 
          data.tecnico_asignado_id === null || 
          (typeof data.tecnico_asignado_id === 'number' && isNaN(data.tecnico_asignado_id))
            ? null 
            : data.tecnico_asignado_id;
      }
      
      if (user?.role === 'administrator' && isEditing) {
        dataToSend.equipment_ids = selectedEquipmentIds;
      }
      
      console.log('Datos a enviar:', dataToSend);
      
      updateTicketMutation.mutate(
        { id, data: dataToSend },
        {
          onSuccess: () => {
            setIsEditing(false);
            if (location.pathname.includes('/editar')) {
              navigate(`/tickets/${id}`);
            }
          },
        }
      );
    }
  };

  const onComment = (data: CommentData) => {
    if (!id) return;
    addCommentMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          resetComment();
        },
      }
    );
  };

  const handleStartProgress = () => {
    if (!id) return;
    startProgressMutation.mutate(id);
  };

  const handleMarkAsResolved = () => {
    if (!id) return;
    markAsResolvedMutation.mutate(id);
  };

  const isAssignedTechnician = user?.role === 'technician' && ticket?.assigned_technician_id === user?.id;
  const isTicketCreatorEndUser =
    user?.role === 'end_user' && ticket?.created_by_user_id === user?.id;
  const canEdit = user?.role === 'administrator' || isAssignedTechnician;
  const canComment = user?.role !== undefined;

  if (loadingTicket) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="text-center">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-sky-400/30 border-t-sky-400" />
                <p className="mt-3 text-sm text-blue-100/80">Cargando ticket...</p>
              </div>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  if (!ticket) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
          <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
            <div className="card text-center py-12">
              <p className="text-blue-100/90">Ticket no encontrado</p>
              <button
                type="button"
                onClick={() => navigate('/tickets')}
                className="btn-primary mt-4"
              >
                Volver a Tickets
              </button>
            </div>
          </div>
        </PageWrapper>
      </>
    );
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Fecha no disponible';

    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const translateChangeType = (changeType: string | null | undefined) => {
    if (!changeType) return 'Cambio';
    const type = changeType.toUpperCase();
    switch (type) {
      case 'UPDATE':
        return 'ACTUALIZACIÓN';
      case 'CREATION':
        return 'CREACIÓN';
      case 'DELETE':
        return 'ELIMINACIÓN';
      default:
        return changeType;
    }
  };

  const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
  const resolveImageUrl = (url: string) =>
    url.startsWith('http://') || url.startsWith('https://') ? url : `${apiBaseUrl}${url}`;
  const imagenes = ticket.imagenes && ticket.imagenes.length > 0
    ? ticket.imagenes
    : ticket.imagen_url
      ? [ticket.imagen_url]
      : [];

  return (
    <>
      <MainNavbar />
      <PageWrapper>
        <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6 space-y-6">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-100 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a Tickets
            </button>

            <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-sky-200/80">
                  Detalle del ticket
                </p>
                <h1 className="page-heading break-words">{ticket.title}</h1>
                <p className="font-mono text-xs sm:text-sm text-sky-100/90 break-all rounded-lg bg-slate-950/40 border border-sky-400/25 px-3 py-1.5 inline-block max-w-full">
                  ID: {ticket.id}
                </p>
              </div>
              <div className="badge-group shrink-0 self-start">
                <StatusBadge
                  estado={
                    isAssignedTechnician && ticket.state_id === 1
                      ? estados.find(e => e.id === 2)?.name || 'Asignado'
                      : ticket.state_name || ''
                  }
                  colorOverride={
                    isAssignedTechnician && ticket.state_id === 1
                      ? estados.find(e => e.id === 2)?.color || 'bg-yellow-100'
                      : ticket.state_color
                  }
                />
                <PriorityBadge
                  prioridad={ticket.priority_name || ''}
                  colorOverride={ticket.priority_color}
                />
                <CategoryBadge categoria={ticket.category_name || ''} />
              </div>
            </header>

            <div className="h-px bg-gradient-to-r from-transparent via-sky-400/35 to-transparent" aria-hidden />

            {((isAssignedTechnician && (ticket.state_id === 2 || ticket.state_id === 3)) ||
              (canEdit && !isEditing) ||
              (isTicketCreatorEndUser && (ticket.state_id === 2 || ticket.state_id === 3))) && (
              <div className="flex flex-wrap items-center gap-3">
                {isAssignedTechnician && ticket.state_id === 2 && (
                  <button
                    type="button"
                    onClick={handleStartProgress}
                    disabled={startProgressMutation.isPending}
                    className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {startProgressMutation.isPending ? 'Iniciando...' : 'Iniciar progreso'}
                  </button>
                )}

                {((isAssignedTechnician && ticket.state_id === 3) ||
                  (isTicketCreatorEndUser && (ticket.state_id === 2 || ticket.state_id === 3))) && (
                  <button
                    type="button"
                    onClick={handleMarkAsResolved}
                    disabled={markAsResolvedMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 transition-all"
                  >
                    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {markAsResolvedMutation.isPending ? 'Marcando...' : 'Marcar como resuelto'}
                  </button>
                )}

                {canEdit && !isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      if (ticket) {
                        const isAssignedTechnicianEdit =
                          user?.role === 'technician' && ticket.assigned_technician_id === user?.id;
                        const defaultEstadoId =
                          isAssignedTechnicianEdit && ticket.state_id === 1 ? 2 : ticket.state_id;

                        resetUpdate({
                          titulo: ticket.title,
                          descripcion: ticket.description,
                          categoria_id: ticket.category_id,
                          prioridad_id: ticket.priority_id,
                          estado_id: defaultEstadoId,
                          tecnico_asignado_id: ticket.assigned_technician_id || null,
                        });
                      }
                      setIsEditing(true);
                    }}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar ticket
                  </button>
                )}
              </div>
            )}

            <div className="card space-y-6">

          {isEditing && canEdit ? (
            <form onSubmit={handleSubmitUpdate(onUpdate)} className="space-y-5">
              {user?.role === 'administrator' ? (
                <>
                  <div>
                    <label htmlFor="ticket-edit-title" className="label-field">Título</label>
                    <input
                      id="ticket-edit-title"
                      {...registerUpdate('titulo')}
                      className="input-dark"
                    />
                    {errorsUpdate.titulo && (
                      <p className="error-message">{errorsUpdate.titulo.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="ticket-edit-description" className="label-field">Descripción</label>
                    <textarea
                      id="ticket-edit-description"
                      {...registerUpdate('descripcion')}
                      rows={6}
                      className="input-dark resize-y min-h-[8rem]"
                    />
                    {errorsUpdate.descripcion && (
                      <p className="error-message">{errorsUpdate.descripcion.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <label htmlFor="ticket-edit-state" className="label-field">Estado</label>
                      <select
                        id="ticket-edit-state"
                        {...registerUpdate('estado_id', { valueAsNumber: true })}
                        className={`input-dark ${formStyles.selectField}`}
                      >
                        {estados.map((estado) => (
                          <option key={estado.id} value={estado.id}>
                            {estado.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="ticket-edit-technician" className="label-field">Técnico asignado</label>
                      <Controller
                        name="tecnico_asignado_id"
                        control={controlUpdate}
                        render={({ field }) => (
                          <select
                            id="ticket-edit-technician"
                            value={field.value === null || field.value === undefined ? '' : String(field.value)}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || value === null || value === undefined) {
                                field.onChange(null);
                              } else {
                                const numValue = parseInt(value, 10);
                                field.onChange(isNaN(numValue) ? null : numValue);
                              }
                            }}
                            onBlur={field.onBlur}
                            className={`input-dark ${formStyles.selectField}`}
                          >
                            <option value="">Sin asignar</option>
                            {tecnicos.map((tecnico) => (
                              <option key={tecnico.id} value={tecnico.id}>
                                {tecnico.full_name}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="ticket-edit-equipment" className="label-field">
                      Equipos informáticos
                    </label>
                    <select
                      id="ticket-edit-equipment"
                      multiple
                      value={selectedEquipmentIds.map(String)}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                        setSelectedEquipmentIds(selected);
                      }}
                      className="input-dark min-h-[120px]"
                      size={5}
                    >
                      {equipos.length === 0 ? (
                        <option disabled>No hay equipos disponibles</option>
                      ) : (
                        equipos.map((equipo) => (
                          <option key={equipo.id} value={equipo.id}>
                            {equipo.name} {equipo.brand && equipo.model ? `(${equipo.brand} ${equipo.model})` : ''} {equipo.serial_number ? `- SN: ${equipo.serial_number}` : ''}
                          </option>
                        ))
                      )}
                    </select>
                    <p className="mt-1 text-xs text-blue-100/70">
                      Mantén presionada Ctrl (o Cmd en Mac) para seleccionar varios equipos
                    </p>
                    {selectedEquipmentIds.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedEquipmentIds.map((id) => {
                          const equipo = equipos.find(e => e.id === id);
                          return equipo ? (
                            <span
                              key={id}
                              className="inline-flex items-center px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-100 text-sm ring-1 ring-sky-400/30"
                            >
                              {equipo.name}
                              <button
                                type="button"
                                onClick={() => setSelectedEquipmentIds(prev => prev.filter(eid => eid !== id))}
                                className="ml-2 text-sky-200 hover:text-white"
                                aria-label={`Quitar ${equipo.name}`}
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <label htmlFor="ticket-edit-state-tech" className="label-field">Estado</label>
                  <Controller
                    name="estado_id"
                    control={controlUpdate}
                    render={({ field }) => {
                      const estadosPermitidos = estados.filter(e => 
                        e.id === 2 || e.id === 3 || e.id === 4 || e.id === 5
                      );
                      const estadoAsignado = estados.find(e => e.id === 2);
                      const currentValue = field.value ?? ticket?.state_id ?? 2;
                      const numericValue = typeof currentValue === 'number' ? currentValue : parseInt(String(currentValue), 10);
                      const finalValue = isNaN(numericValue) ? 2 : numericValue;
                      
                      return (
                        <select
                          id="ticket-edit-state-tech"
                          value={finalValue}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value, 10);
                            if (!isNaN(newValue)) {
                              field.onChange(newValue);
                            }
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          className={`input-dark ${formStyles.selectField} ${
                            finalValue === 2 ? 'opacity-70' : ''
                          }`}
                        >
                          {estadoAsignado && (
                            <option 
                              key={estadoAsignado.id} 
                              value={estadoAsignado.id}
                              style={{ 
                                backgroundColor: '#f3f4f6', 
                                color: '#6b7280',
                                fontStyle: 'italic'
                              }}
                            >
                              {estadoAsignado.name}
                            </option>
                          )}
                          {estadosPermitidos
                            .filter(e => e.id !== 2)
                            .map((estado) => (
                              <option key={estado.id} value={estado.id}>
                                {estado.name}
                              </option>
                            ))}
                        </select>
                      );
                    }}
                  />
                  <p className="mt-2 text-sm text-blue-100/75">
                    Como técnico, solo puedes modificar el estado. Para otros cambios, contacta a un administrador.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    if (location.pathname.includes('/editar')) {
                      navigate(`/tickets/${id}`);
                    }
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar cambios
                </button>
              </div>
            </form>
          ) : (
            <>
              <section className="space-y-5" aria-labelledby="ticket-content-heading">
                <h2 id="ticket-content-heading" className="sr-only">
                  Contenido del ticket
                </h2>
                <div className="detail-field">
                  <p className="detail-field__label">Título</p>
                  <div className="detail-field__value">{ticket.title}</div>
                </div>
                <div className="detail-field">
                  <p className="detail-field__label">Descripción</p>
                  <div className="detail-field__value min-h-[4.5rem]">
                    {ticket.description?.trim() || 'Sin descripción registrada.'}
                  </div>
                </div>
              </section>

              <div className="space-y-4 pt-2 border-t border-sky-400/20">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Información del ticket
                </h2>
                <div className="ticket-info-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="stat-card stat-card--sky">
                    <p className="stat-card-title">Área del incidente</p>
                    <p className="stat-card-value text-lg sm:text-xl mt-1">{ticket.incident_area_name || 'N/A'}</p>
                  </div>
                  <div className="stat-card stat-card--violet">
                    <p className="stat-card-title">Creado por</p>
                    <p className="stat-card-value text-lg sm:text-xl mt-1 truncate">{ticket.created_by_user_name || 'N/A'}</p>
                  </div>
                  <div className="stat-card stat-card--emerald">
                    <p className="stat-card-title">Fecha de creación</p>
                    <p className="stat-card-value text-base sm:text-lg mt-1 leading-snug">{formatDate(ticket.created_at)}</p>
                  </div>
                  {ticket.assigned_technician_name && (
                    <div className="stat-card stat-card--amber">
                      <p className="stat-card-title">Técnico asignado</p>
                      <p className="stat-card-value text-lg sm:text-xl mt-1 truncate">{ticket.assigned_technician_name}</p>
                    </div>
                  )}
                  {ticket.closed_at && (
                    <div className="stat-card stat-card--violet">
                      <p className="stat-card-title">Fecha de cierre</p>
                      <p className="stat-card-value text-base sm:text-lg mt-1 leading-snug">{formatDate(ticket.closed_at)}</p>
                    </div>
                  )}
                </div>
              </div>

              {imagenes.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Imágenes adjuntas ({imagenes.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {imagenes.map((relativeUrl, index) => (
                      <a
                        key={`${relativeUrl}-${index}`}
                        href={resolveImageUrl(relativeUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative rounded-xl overflow-hidden ring-1 ring-white/15 hover:ring-sky-400/50 transition-all"
                      >
                        <img
                          src={resolveImageUrl(relativeUrl)}
                          alt={`Imagen ${index + 1} del ticket`}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-colors flex items-end justify-center p-2">
                          <span className="text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            Ver imagen {index + 1}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
            </div>

            {ticket.equipment && ticket.equipment.length > 0 && (
              <div className="card space-y-5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  Equipos asociados ({ticket.equipment.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ticket.equipment.map((equipo) => (
                    <div key={equipo.id} className="info-tile space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-blue-50">{equipo.name}</h3>
                        {equipo.type_name && (
                          <span className="text-xs shrink-0 px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/25">
                            {equipo.type_name}
                          </span>
                        )}
                      </div>
                      {equipo.brand && equipo.model && (
                        <p className="text-sm text-blue-100/80">
                          <span className="text-blue-50/90">Marca/modelo:</span> {equipo.brand} {equipo.model}
                        </p>
                      )}
                      {equipo.serial_number && (
                        <p className="text-sm text-blue-100/80">
                          <span className="text-blue-50/90">Serie:</span> {equipo.serial_number}
                        </p>
                      )}
                      {equipo.location && (
                        <p className="text-sm text-blue-100/80">
                          <span className="text-blue-50/90">Ubicación:</span> {equipo.location}
                        </p>
                      )}
                      {equipo.assigned_to_user_name && (
                        <p className="text-sm text-blue-100/80">
                          <span className="text-blue-50/90">Asignado a:</span> {equipo.assigned_to_user_name}
                        </p>
                      )}
                      {equipo.status && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${
                            equipo.status === 'available'
                              ? 'bg-emerald-500/20 text-emerald-100 ring-emerald-400/30'
                              : equipo.status === 'assigned'
                                ? 'bg-sky-500/20 text-sky-100 ring-sky-400/30'
                                : equipo.status === 'maintenance'
                                  ? 'bg-amber-500/20 text-amber-100 ring-amber-400/30'
                                  : 'bg-slate-500/20 text-slate-200 ring-slate-400/30'
                          }`}
                        >
                          {equipo.status === 'available'
                            ? 'Disponible'
                            : equipo.status === 'assigned'
                              ? 'Asignado'
                              : equipo.status === 'maintenance'
                                ? 'En mantenimiento'
                                : equipo.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {canComment && (
              <div className="card space-y-5">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-6 h-6 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar comentario
                </h2>
                <form onSubmit={handleSubmitComment(onComment)} className="space-y-4">
                  {showFrequentIssueCommentTemplates && (
                    <div>
                      <label htmlFor="frequent-issue-template" className="label-field flex items-center gap-2">
                        <FrequentIssueIcon className="h-5 w-5 shrink-0 text-sky-300" />
                        Plantilla de falla frecuente (opcional)
                      </label>
                      <select
                        id="frequent-issue-template"
                        defaultValue=""
                        aria-label="Insertar plantilla de falla frecuente"
                        onChange={(e) => {
                          const selectedIssueId = Number(e.target.value);
                          if (!selectedIssueId) return;

                          const selectedIssue = frequentIssues.find((issue) => issue.id === selectedIssueId);
                          if (!selectedIssue) return;

                          const currentComment = getCommentValues('contenido') || '';
                          const solutionBlock = `Diagnóstico sugerido: ${selectedIssue.title}\nPosible solución: ${selectedIssue.possible_solution}`;
                          const userText = stripFrequentIssueCommentTemplates(currentComment);
                          const nextComment =
                            userText.length > 0 ? `${userText}\n\n${solutionBlock}` : solutionBlock;

                          setCommentValue('contenido', nextComment, { shouldValidate: true });
                        }}
                        className={`input-dark ${formStyles.selectField}`}
                      >
                        <option value="">Seleccionar plantilla...</option>
                        {frequentIssues.map((issue) => (
                          <option key={issue.id} value={issue.id}>
                            {issue.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label htmlFor="comment-content" className="label-field">Comentario</label>
                    <textarea
                      id="comment-content"
                      {...registerComment('contenido')}
                      rows={4}
                      className="input-dark resize-y min-h-[6rem]"
                      placeholder="Escribe tu comentario aquí..."
                    />
                    {errorsComment.contenido && (
                      <p className="error-message">{errorsComment.contenido.message}</p>
                    )}
                  </div>
                  <button type="submit" className="btn-primary inline-flex items-center gap-2">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Publicar comentario
                  </button>
                </form>
              </div>
            )}

            <div className="card space-y-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Comentarios ({comentarios.length})
              </h2>
              {comentarios.length === 0 ? (
                <div className="text-center py-10 content-panel !mb-0">
                  <svg className="w-14 h-14 mx-auto text-sky-400/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-blue-100/80">No hay comentarios aún</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {comentarios.map((comentario) => (
                    <li
                      key={comentario.id}
                      className="content-panel content-panel--sky !mb-0 !p-4 border-l-4 border-l-sky-400/80"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-sky-500/25 ring-1 ring-sky-400/40 flex items-center justify-center text-sky-200 font-semibold text-sm">
                            {(comentario.user_name || '?').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-blue-50 truncate">
                              {comentario.user_name || 'Usuario desconocido'}
                            </p>
                            <p className="text-xs text-blue-100/70">{formatDate(comentario.created_at)}</p>
                          </div>
                        </div>
                        <span className="text-xs shrink-0 self-start px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-100 ring-1 ring-violet-400/30 font-medium">
                          {translateRole(comentario.user_role || '')}
                        </span>
                      </div>
                      <p className="text-blue-100/90 leading-relaxed whitespace-pre-wrap">
                        {comentario.content || 'Sin contenido'}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card space-y-5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Historial de cambios
              </h2>
              {historial.length === 0 ? (
                <div className="text-center py-10 content-panel !mb-0">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-500/15 ring-1 ring-sky-400/25 mb-3">
                    <svg className="w-8 h-8 text-sky-300/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-blue-100/85 font-medium">No hay historial de cambios</p>
                  <p className="text-blue-100/60 text-sm mt-1">Los cambios en este ticket aparecerán aquí</p>
                </div>
              ) : (
              <div className="relative pl-8 sm:pl-10">
                <div className="absolute left-3 sm:left-4 top-2 bottom-2 w-px bg-gradient-to-b from-sky-400/50 via-sky-300/30 to-transparent" aria-hidden />
                {historial.map((item) => {
                  const getChangeTypeConfig = (changeType: string) => {
                    const type = changeType.toUpperCase();
                    switch (type) {
                      case 'CREATION':
                        return {
                          badge: 'bg-sky-500/20 text-sky-100 ring-sky-400/35',
                          border: 'border-l-sky-400',
                          iconBg: 'bg-sky-500 ring-sky-400/50',
                        };
                      case 'UPDATE':
                        return {
                          badge: 'bg-violet-500/20 text-violet-100 ring-violet-400/35',
                          border: 'border-l-violet-400',
                          iconBg: 'bg-violet-500 ring-violet-400/50',
                        };
                      case 'DELETE':
                        return {
                          badge: 'bg-rose-500/20 text-rose-100 ring-rose-400/35',
                          border: 'border-l-rose-400',
                          iconBg: 'bg-rose-500 ring-rose-400/50',
                        };
                      default:
                        return {
                          badge: 'bg-slate-500/20 text-slate-200 ring-slate-400/35',
                          border: 'border-l-slate-400',
                          iconBg: 'bg-slate-500 ring-slate-400/50',
                        };
                    }
                  };

                  const config = getChangeTypeConfig(item.change_type);

                  return (
                    <div key={item.id} className="relative mb-5 last:mb-0 pl-2">
                      <div
                        className={`absolute -left-[1.35rem] sm:-left-6 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold ring-2 ${config.iconBg}`}
                        aria-hidden
                      >
                        {(item.user_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className={`content-panel content-panel--sky !mb-0 !p-4 border-l-4 ${config.border}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <span
                            className={`inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${config.badge}`}
                          >
                            {translateChangeType(item.change_type)}
                          </span>
                          <time className="text-xs text-blue-100/70">{formatDate(item.changed_at)}</time>
                        </div>

                        {item.description && (
                          <p className="text-sm text-blue-100/85 leading-relaxed mb-3 rounded-lg bg-slate-900/40 px-3 py-2 ring-1 ring-white/5">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                          <p className="text-sm font-medium text-blue-50 truncate">
                            {item.user_name || 'Usuario desconocido'}
                          </p>
                          {item.user_email && (
                            <span className="text-xs text-blue-100/60 truncate hidden sm:inline">
                              · {item.user_email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
