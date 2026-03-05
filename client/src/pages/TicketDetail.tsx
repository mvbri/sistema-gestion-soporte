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

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const { data: ticketData, isLoading: loadingTicket } = useTicket(id);
  const { data: estados = [] } = useEstados();
  const { data: tecnicos = [] } = useTecnicos();
  const { data: equipmentData } = useEquipment({ limit: 1000 });
  const equipos = equipmentData?.equipment || [];
  
  const updateTicketMutation = useUpdateTicket();
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<number[]>([]);
  const addCommentMutation = useAddComment();
  const startProgressMutation = useStartProgress();
  const markAsResolvedMutation = useMarkAsResolved();

  const ticket = ticketData?.ticket;
  const comentarios = ticketData?.comentarios || [];
  const historial = (ticketData?.historial || []).sort((a, b) => {
    const dateA = new Date(a.changed_at || a.created_at || 0).getTime();
    const dateB = new Date(b.changed_at || b.created_at || 0).getTime();
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
  const canEdit = user?.role === 'administrator' || isAssignedTechnician;
  const canComment = user?.role !== undefined;

  if (loadingTicket) {
    return (
      <>
        <MainNavbar />
        <PageWrapper>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando ticket...</p>
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
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-gray-500">Ticket no encontrado</p>
            <button
              onClick={() => navigate('/tickets')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
  const imagenes = ticket.imagenes && ticket.imagenes.length > 0
    ? ticket.imagenes
    : ticket.imagen_url
      ? [ticket.imagen_url]
      : [];

  return (
    <>
      <MainNavbar />
      <PageWrapper>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/tickets')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Tickets
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 mb-6">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-3">{ticket.title}</h1>
                <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2.5 inline-block mt-2">
                  <p className="text-xs text-white font-mono tracking-wider break-all">ID: {ticket.id}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
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
            </div>
          </div>

          {/* Barra de Acciones */}
          {((isAssignedTechnician && (ticket.state_id === 2 || ticket.state_id === 3)) || (canEdit && !isEditing)) ? (
            <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-6 sm:px-8 py-4">
              <div className="flex flex-wrap items-center gap-3">
                {isAssignedTechnician && ticket.state_id === 2 && (
                  <button
                    onClick={handleStartProgress}
                    disabled={startProgressMutation.isPending}
                    className="group px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out flex items-center gap-2 transform hover:scale-105"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {startProgressMutation.isPending ? 'Iniciando...' : 'Iniciar Progreso'}
                  </button>
                )}

                {isAssignedTechnician && ticket.state_id === 3 && (
                  <button
                    onClick={handleMarkAsResolved}
                    disabled={markAsResolvedMutation.isPending}
                    className="group px-6 py-3 bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-green-600 hover:via-green-700 hover:to-green-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out flex items-center gap-2 transform hover:scale-105"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {markAsResolvedMutation.isPending ? 'Marcando...' : 'Marcar como Resuelto'}
                  </button>
                )}

                {canEdit && !isEditing && (
                  <button
                    onClick={() => {
                      if (ticket) {
                        const isAssignedTechnician = user?.role === 'technician' && ticket.assigned_technician_id === user?.id;
                        const defaultEstadoId = isAssignedTechnician && ticket.state_id === 1 ? 2 : ticket.state_id;
                        
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
                    className="group px-6 py-3 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 active:scale-95 transition-all duration-300 ease-in-out flex items-center gap-2 transform hover:scale-105"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Editar Ticket
                  </button>
                )}
              </div>
            </div>
          ) : null}
          
          {/* Contenido */}
          <div className="p-6 sm:p-8">

          {isEditing && canEdit ? (
            <form onSubmit={handleSubmitUpdate(onUpdate)} className="space-y-4">
              {user?.role === 'administrator' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                      {...registerUpdate('titulo')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {errorsUpdate.titulo && (
                      <p className="mt-1 text-sm text-red-600">{errorsUpdate.titulo.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      {...registerUpdate('descripcion')}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    {errorsUpdate.descripcion && (
                      <p className="mt-1 text-sm text-red-600">{errorsUpdate.descripcion.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        {...registerUpdate('estado_id', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {estados.map((estado) => (
                          <option key={estado.id} value={estado.id}>
                            {estado.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Técnico Asignado</label>
                      <Controller
                        name="tecnico_asignado_id"
                        control={controlUpdate}
                        render={({ field }) => (
                          <select
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Equipos Informáticos
                    </label>
                    <select
                      multiple
                      value={selectedEquipmentIds.map(String)}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                        setSelectedEquipmentIds(selected);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
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
                    <p className="mt-1 text-xs text-gray-500">
                      Mantén presionada la tecla Ctrl (o Cmd en Mac) para seleccionar múltiples equipos
                    </p>
                    {selectedEquipmentIds.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedEquipmentIds.map((id) => {
                          const equipo = equipos.find(e => e.id === id);
                          return equipo ? (
                            <span
                              key={id}
                              className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm"
                            >
                              {equipo.name}
                              <button
                                type="button"
                                onClick={() => setSelectedEquipmentIds(prev => prev.filter(eid => eid !== id))}
                                className="ml-2 text-blue-600 hover:text-blue-800"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
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
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                            finalValue === 2 ? 'bg-gray-100 text-gray-600' : ''
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
                  <p className="mt-2 text-sm text-gray-500">
                    Como técnico, solo puedes modificar el estado del ticket. Para otros cambios, contacta a un administrador.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    if (location.pathname.includes('/editar')) {
                      navigate(`/tickets/${id}`);
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descripción
                </h3>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Información del Ticket
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-semibold text-gray-900 text-sm">Área del Incidente</span>
                    </div>
                    <p className="text-gray-700 font-medium">{ticket.incident_area_name || 'N/A'}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-semibold text-gray-900 text-sm">Creado por</span>
                    </div>
                    <p className="text-gray-700 font-medium">{ticket.created_by_user_name || 'N/A'}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-semibold text-gray-900 text-sm">Fecha de Creación</span>
                    </div>
                    <p className="text-gray-700 font-medium">{formatDate(ticket.created_at)}</p>
                  </div>
                  {ticket.assigned_technician_name && (
                    <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-gray-900 text-sm">Técnico Asignado</span>
                      </div>
                      <p className="text-gray-700 font-medium">{ticket.assigned_technician_name}</p>
                    </div>
                  )}
                  {ticket.closed_at && (
                    <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="font-semibold text-gray-900 text-sm">Fecha de Cierre</span>
                      </div>
                      <p className="text-gray-700 font-medium">{formatDate(ticket.closed_at)}</p>
                    </div>
                  )}
                </div>
              </div>

              {imagenes.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Imágenes Adjuntas ({imagenes.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {imagenes.map((relativeUrl, index) => (
                      <div key={`${relativeUrl}-${index}`} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 hover:shadow-lg transition-shadow duration-200">
                        <img
                          src={`${apiBaseUrl}${relativeUrl}`}
                          alt={`Imagen ${index + 1} del ticket`}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">Imagen {index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </div>

        {ticket.equipment && ticket.equipment.length > 0 && (
          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 mb-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              Equipos Informáticos Asociados ({ticket.equipment.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ticket.equipment.map((equipo) => (
                <div
                  key={equipo.id}
                  className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{equipo.name}</h3>
                    {equipo.type_name && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {equipo.type_name}
                      </span>
                    )}
                  </div>
                  {equipo.brand && equipo.model && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Marca/Modelo:</span> {equipo.brand} {equipo.model}
                    </p>
                  )}
                  {equipo.serial_number && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Número de Serie:</span> {equipo.serial_number}
                    </p>
                  )}
                  {equipo.location && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Ubicación:</span> {equipo.location}
                    </p>
                  )}
                  {equipo.assigned_to_user_name && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Asignado a:</span> {equipo.assigned_to_user_name}
                    </p>
                  )}
                  {equipo.status && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        equipo.status === 'available' ? 'bg-green-100 text-green-800' :
                        equipo.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        equipo.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {equipo.status === 'available' ? 'Disponible' :
                         equipo.status === 'assigned' ? 'Asignado' :
                         equipo.status === 'maintenance' ? 'En Mantenimiento' :
                         equipo.status}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {canComment && (
          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 mb-6 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar Comentario
            </h2>
            <form onSubmit={handleSubmitComment(onComment)}>
              <textarea
                {...registerComment('contenido')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mb-4 resize-none"
                placeholder="Escribe tu comentario aquí..."
              />
              {errorsComment.contenido && (
                <p className="mb-4 text-sm text-red-600">{errorsComment.contenido.message}</p>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-95 transition-all duration-200 ease-in-out flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Comentario
              </button>
            </form>
          </div>
        )}

        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 mb-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comentarios ({comentarios.length})
          </h2>
          <div className="space-y-4">
            {comentarios.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500 text-lg">No hay comentarios aún</p>
              </div>
            ) : (
              comentarios.map((comentario) => (
                <div key={comentario.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{comentario.user_name || 'Usuario desconocido'}</p>
                        <p className="text-sm text-gray-500">{formatDate(comentario.created_at)}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">{translateRole(comentario.user_role || '')}</span>
                  </div>
                  <div className="bg-white rounded-md p-3 border border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{comentario.content || 'Sin contenido'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Historial de Cambios
          </h2>
          <div className="relative">
            {historial.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">No hay historial de cambios</p>
                <p className="text-gray-400 text-sm mt-1">Los cambios realizados en este ticket aparecerán aquí</p>
              </div>
            ) : (
              <div className="relative pl-8">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-blue-200"></div>
                {historial.map((item, index) => {
                  const getChangeTypeConfig = (changeType: string) => {
                    const type = changeType.toUpperCase();
                    switch (type) {
                      case 'CREATION':
                        return {
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          ),
                          bgColor: 'bg-blue-100',
                          borderColor: 'border-blue-500',
                          textColor: 'text-blue-700',
                          iconBg: 'bg-blue-500',
                        };
                      case 'UPDATE':
                        return {
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          ),
                          bgColor: 'bg-purple-100',
                          borderColor: 'border-purple-500',
                          textColor: 'text-purple-700',
                          iconBg: 'bg-purple-500',
                        };
                      case 'DELETE':
                        return {
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          ),
                          bgColor: 'bg-red-100',
                          borderColor: 'border-red-500',
                          textColor: 'text-red-700',
                          iconBg: 'bg-red-500',
                        };
                      default:
                        return {
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ),
                          bgColor: 'bg-gray-100',
                          borderColor: 'border-gray-500',
                          textColor: 'text-gray-700',
                          iconBg: 'bg-gray-500',
                        };
                    }
                  };

                  const config = getChangeTypeConfig(item.change_type);

                  return (
                    <div key={item.id} className="relative mb-6 last:mb-0 group">
                      <div className="absolute -left-11 top-1 z-10">
                        <div className={`${config.iconBg} rounded-full p-2 text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                          {config.icon}
                        </div>
                      </div>
                      <div className={`bg-white rounded-xl shadow-sm border-l-4 ${config.borderColor} hover:shadow-md transition-all duration-200 overflow-hidden`}>
                        <div className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
                                {translateChangeType(item.change_type)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">{formatDate(item.changed_at)}</span>
                            </div>
                          </div>
                          
                          {item.description && (
                            <div className="mb-3">
                              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-200">
                                {item.description}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs font-semibold shadow-sm">
                              {item.user_name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.user_name || 'Usuario desconocido'}
                              </p>
                              {item.user_email && (
                                <p className="text-xs text-gray-500 truncate">{item.user_email}</p>
                              )}
                            </div>
                          </div>
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
      </div>
      </PageWrapper>
    </>
  );
};
