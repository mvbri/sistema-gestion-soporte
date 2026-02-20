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
      const isAssignedTechnician = user?.role === 'technician' && ticket.tecnico_asignado_id === user?.id;
      const defaultEstadoId = isAssignedTechnician && ticket.estado_id === 1 ? 2 : ticket.estado_id;
      
      resetUpdate({
        titulo: ticket.titulo,
        descripcion: ticket.descripcion,
        area_incidente: ticket.area_incidente,
        categoria_id: ticket.categoria_id,
        prioridad_id: ticket.prioridad_id,
        estado_id: defaultEstadoId,
        tecnico_asignado_id: ticket.tecnico_asignado_id || null,
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
    if (user?.role === 'administrator' && isEditing && ticket && tecnicoAsignadoId) {
      const estadoAsignado = estados.find(e => e.id === 2);
      const estadoIdForm = estadoIdActual || ticket.estado_id;
      
      if (estadoAsignado && estadoIdForm === 1) {
        setValueUpdate('estado_id', 2, { shouldValidate: true });
      }
    }
  }, [tecnicoAsignadoId, ticket, estados, user, isEditing, setValueUpdate, estadoIdActual]);

  const onUpdate = (data: UpdateTicketData) => {
    if (!id) return;
    
    const isAssignedTechnician = user?.role === 'technician' && ticket?.tecnico_asignado_id === user?.id;
    const dataToSend = isAssignedTechnician 
      ? { estado_id: data.estado_id }
      : data;
    
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

  const isAssignedTechnician = user?.role === 'technician' && ticket?.tecnico_asignado_id === user?.id;
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
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
              <h1 className="text-2xl font-bold text-gray-900">{ticket.titulo}</h1>
              <p className="text-sm text-gray-500 mt-1">ID: {ticket.id}</p>
            </div>
            <div className="flex items-center space-x-2">
              <StatusBadge
                estado={
                  isAssignedTechnician && ticket.estado_id === 1
                    ? estados.find(e => e.id === 2)?.nombre || 'Asignado'
                    : ticket.estado_nombre || ''
                }
                colorOverride={
                  isAssignedTechnician && ticket.estado_id === 1
                    ? estados.find(e => e.id === 2)?.color || 'bg-yellow-100'
                    : ticket.estado_color
                }
              />
              <PriorityBadge
                prioridad={ticket.prioridad_nombre || ''}
                colorOverride={ticket.prioridad_color}
              />
              <CategoryBadge categoria={ticket.categoria_nombre || ''} />
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
                            {estado.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Técnico Asignado</label>
                      <select
                        {...registerUpdate('tecnico_asignado_id', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Sin asignar</option>
                        {tecnicos.map((tecnico) => (
                          <option key={tecnico.id} value={tecnico.id}>
                            {tecnico.full_name}
                          </option>
                        ))}
                      </select>
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
                      const currentValue = field.value || ticket?.estado_id || '';
                      
                      return (
                        <select
                          {...field}
                          value={currentValue}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value);
                            if (newValue !== 2) {
                              field.onChange(newValue);
                            }
                          }}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                            currentValue === 2 ? 'bg-gray-100 text-gray-600' : ''
                          }`}
                        >
                          {estadoAsignado && (
                            <option 
                              key={estadoAsignado.id} 
                              value={estadoAsignado.id}
                              disabled
                              style={{ 
                                backgroundColor: '#f3f4f6', 
                                color: '#6b7280',
                                fontStyle: 'italic'
                              }}
                            >
                              {estadoAsignado.nombre}
                            </option>
                          )}
                          {estadosPermitidos
                            .filter(e => e.id !== 2)
                            .map((estado) => (
                              <option key={estado.id} value={estado.id}>
                                {estado.nombre}
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
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.descripcion}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Área del Incidente:</span> {ticket.area_incidente}
                </div>
                <div>
                  <span className="font-medium">Creado por:</span> {ticket.usuario_creador_nombre}
                </div>
                <div>
                  <span className="font-medium">Fecha de Creación:</span> {formatDate(ticket.fecha_creacion)}
                </div>
                {ticket.tecnico_asignado_nombre && (
                  <div>
                    <span className="font-medium">Técnico Asignado:</span> {ticket.tecnico_asignado_nombre}
                  </div>
                )}
                {ticket.fecha_cierre && (
                  <div>
                    <span className="font-medium">Fecha de Cierre:</span> {formatDate(ticket.fecha_cierre)}
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

              {isAssignedTechnician && ticket.estado_id === 2 && (
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={handleStartProgress}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                  >
                    Iniciar Progreso
                  </button>
                </div>
              )}

              {isAssignedTechnician && ticket.estado_id === 3 && (
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
                        const isAssignedTechnician = user?.role === 'technician' && ticket.tecnico_asignado_id === user?.id;
                        const defaultEstadoId = isAssignedTechnician && ticket.estado_id === 1 ? 2 : ticket.estado_id;
                        
                        resetUpdate({
                          titulo: ticket.titulo,
                          descripcion: ticket.descripcion,
                          area_incidente: ticket.area_incidente,
                          categoria_id: ticket.categoria_id,
                          prioridad_id: ticket.prioridad_id,
                          estado_id: defaultEstadoId,
                          tecnico_asignado_id: ticket.tecnico_asignado_id || null,
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
                      <p className="font-medium">{comentario.usuario_nombre}</p>
                      <p className="text-sm text-gray-500">{formatDate(comentario.fecha_creacion)}</p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{translateRole(comentario.usuario_rol)}</span>
                  </div>
                  <p className="text-gray-700">{comentario.contenido}</p>
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
                    <p className="font-medium">{item.tipo_cambio}</p>
                    <p className="text-sm text-gray-500">{formatDate(item.fecha_cambio)}</p>
                  </div>
                  {item.descripcion && <p className="text-sm text-gray-600">{item.descripcion}</p>}
                  <p className="text-xs text-gray-500">Por: {item.usuario_nombre}</p>
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
