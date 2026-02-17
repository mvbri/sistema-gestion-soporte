import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import { ticketService } from '../services/ticketService';
import { updateTicketSchema, commentSchema, type UpdateTicketData, type CommentData } from '../schemas/ticketSchemas';
import type { Ticket, TicketComentario, TicketHistorial, EstadoTicket, CategoriaTicket, PrioridadTicket, Tecnico } from '../types';
import { StatusBadge } from '../components/tickets/StatusBadge';
import { PriorityBadge } from '../components/tickets/PriorityBadge';
import { CategoryBadge } from '../components/tickets/CategoryBadge';

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comentarios, setComentarios] = useState<TicketComentario[]>([]);
  const [historial, setHistorial] = useState<TicketHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [estados, setEstados] = useState<EstadoTicket[]>([]);
  const [categorias, setCategorias] = useState<CategoriaTicket[]>([]);
  const [prioridades, setPrioridades] = useState<PrioridadTicket[]>([]);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    formState: { errors: errorsUpdate },
    reset: resetUpdate,
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
    if (id) {
      loadTicket();
      loadOptions();
    }
  }, [id]);

  const loadTicket = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await ticketService.getById(id);
      if (response.success && response.data) {
        setTicket(response.data.ticket);
        setComentarios(response.data.comentarios);
        setHistorial(response.data.historial);
        resetUpdate({
          titulo: response.data.ticket.titulo,
          descripcion: response.data.ticket.descripcion,
          area_incidente: response.data.ticket.area_incidente,
          categoria_id: response.data.ticket.categoria_id,
          prioridad_id: response.data.ticket.prioridad_id,
          estado_id: response.data.ticket.estado_id,
          tecnico_asignado_id: response.data.ticket.tecnico_asignado_id || null,
        });
      }
    } catch (error) {
      toast.error('Error al cargar ticket');
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const [estadosRes, categoriasRes, prioridadesRes, tecnicosRes] = await Promise.all([
        ticketService.getEstados(),
        ticketService.getCategorias(),
        ticketService.getPrioridades(),
        ticketService.getTecnicos(),
      ]);

      if (estadosRes.success && estadosRes.data) setEstados(estadosRes.data);
      if (categoriasRes.success && categoriasRes.data) setCategorias(categoriasRes.data);
      if (prioridadesRes.success && prioridadesRes.data) setPrioridades(prioridadesRes.data);
      if (tecnicosRes.success && tecnicosRes.data) setTecnicos(tecnicosRes.data);
    } catch (error) {
      toast.error('Error al cargar opciones');
    }
  };

  const onUpdate = async (data: UpdateTicketData) => {
    if (!id) return;
    try {
      const response = await ticketService.update(id, data);
      if (response.success) {
        toast.success('Ticket actualizado exitosamente');
        setIsEditing(false);
        loadTicket();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar ticket');
    }
  };

  const onComment = async (data: CommentData) => {
    if (!id) return;
    try {
      const response = await ticketService.addComment(id, data);
      if (response.success) {
        toast.success('Comentario agregado exitosamente');
        resetComment();
        loadTicket();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al agregar comentario');
    }
  };

  const canEdit = user?.role === 'administrator' || user?.role === 'technician';
  const canComment = user?.role !== undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 py-6">
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
                estado={ticket.estado_nombre || ''}
                colorOverride={ticket.estado_color}
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

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
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

              {canEdit && (
                <div className="mt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                  >
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
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{comentario.usuario_rol}</span>
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
  );
};
