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
  
  const updateTicketMutation = useUpdateTicket();
  const addCommentMutation = useAddComment();
  const startProgressMutation = useStartProgress();
  const markAsResolvedMutation = useMarkAsResolved();

  const ticket = ticketData?.ticket;
  const comentarios = ticketData?.comentarios || [];
  const historial = ticketData?.historial || [];

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
        area_incidente_id: ticket.incident_area_id,
        categoria_id: ticket.category_id,
        prioridad_id: ticket.priority_id,
        estado_id: defaultEstadoId,
        tecnico_asignado_id: ticket.assigned_technician_id || null,
      });

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
      if (data.area_incidente_id !== undefined) dataToSend.area_incidente_id = data.area_incidente_id;
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
            className="text-blue-600 hover:text-blue-800"
          >
            ← Volver a Tickets
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
              <p className="text-sm text-gray-500 mt-1">ID: {ticket.id}</p>
            </div>
            <div className="flex items-center space-x-2">
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
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Área del Incidente:</span> {ticket.incident_area_name || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Creado por:</span> {ticket.created_by_user_name || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Fecha de Creación:</span> {formatDate(ticket.created_at)}
                </div>
                {ticket.assigned_technician_name && (
                  <div>
                    <span className="font-medium">Técnico Asignado:</span> {ticket.assigned_technician_name}
                  </div>
                )}
                {ticket.closed_at && (
                  <div>
                    <span className="font-medium">Fecha de Cierre:</span> {formatDate(ticket.closed_at)}
                  </div>
                )}
              </div>

              {imagenes.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {imagenes.map((relativeUrl, index) => (
                    <img
                      key={`${relativeUrl}-${index}`}
                      src={`${apiBaseUrl}${relativeUrl}`}
                      alt={`Imagen ${index + 1} del ticket`}
                      className="w-full h-auto rounded-md object-contain bg-gray-100"
                    />
                  ))}
                </div>
              )}

              {isAssignedTechnician && ticket.state_id === 2 && (
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={handleStartProgress}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    Iniciar Progreso
                  </button>
                </div>
              )}

              {isAssignedTechnician && ticket.state_id === 3 && (
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={handleMarkAsResolved}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Marcar como Resuelto
                  </button>
                </div>
              )}

              {canEdit && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      if (ticket) {
                        const isAssignedTechnician = user?.role === 'technician' && ticket.assigned_technician_id === user?.id;
                        const defaultEstadoId = isAssignedTechnician && ticket.state_id === 1 ? 2 : ticket.state_id;
                        
                        resetUpdate({
                          titulo: ticket.title,
                          descripcion: ticket.description,
                          area_incidente_id: ticket.incident_area_id,
                          categoria_id: ticket.category_id,
                          prioridad_id: ticket.priority_id,
                          estado_id: defaultEstadoId,
                          tecnico_asignado_id: ticket.assigned_technician_id || null,
                        });
                      }
                      setIsEditing(true);
                    }}
                    className="group px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium shadow-md hover:from-orange-600 hover:to-orange-700 hover:shadow-lg active:scale-95 transition-all duration-300 ease-in-out flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:rotate-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Editar Ticket
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {canComment && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Agregar Comentario</h2>
            <form onSubmit={handleSubmitComment(onComment)}>
              <textarea
                {...registerComment('contenido')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                placeholder="Escribe tu comentario aquí..."
              />
              {errorsComment.contenido && (
                <p className="mb-4 text-sm text-red-600">{errorsComment.contenido.message}</p>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Agregar Comentario
              </button>
            </form>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Comentarios ({comentarios.length})</h2>
          <div className="space-y-4">
            {comentarios.length === 0 ? (
              <p className="text-gray-500">No hay comentarios aún</p>
            ) : (
              comentarios.map((comentario) => (
                <div key={comentario.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{comentario.user_name || 'Usuario desconocido'}</p>
                      <p className="text-sm text-gray-500">{formatDate(comentario.created_at)}</p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{translateRole(comentario.user_role || '')}</span>
                  </div>
                  <p className="text-gray-700">{comentario.content || 'Sin contenido'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Cambios</h2>
          <div className="space-y-3">
            {historial.length === 0 ? (
              <p className="text-gray-500">No hay historial de cambios</p>
            ) : (
              historial.map((item) => (
                <div key={item.id} className="border-l-4 border-gray-300 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium">{translateChangeType(item.change_type)}</p>
                    <p className="text-sm text-gray-500">{formatDate(item.changed_at)}</p>
                  </div>
                  {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
                  <p className="text-xs text-gray-500">Por: {item.user_name || 'Usuario desconocido'}</p>
                </div>
              ))
            )}
          </div>
        </div>
        </div>
      </div>
      </PageWrapper>
    </>
  );
};
