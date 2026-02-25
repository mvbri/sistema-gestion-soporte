import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService, type CreateTicketData, type UpdateTicketData, type CommentData } from '../services/ticketService';
import type { TicketFilters, AxiosErrorResponse } from '../types';
import { toast } from 'react-toastify';

export const useTickets = (filters?: TicketFilters) => {
  return useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketService.getAll(filters),
    select: (response) => response.data,
  });
};

export const useTicket = (id: string | undefined) => {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketService.getById(id!),
    enabled: !!id,
    select: (response) => response.data,
  });
};

export const useEstados = () => {
  return useQuery({
    queryKey: ['estados'],
    queryFn: () => ticketService.getEstados(),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCategorias = () => {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: () => ticketService.getCategorias(),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000,
  });
};

export const usePrioridades = () => {
  return useQuery({
    queryKey: ['prioridades'],
    queryFn: () => ticketService.getPrioridades(),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000,
  });
};

export const useDirecciones = () => {
  return useQuery({
    queryKey: ['direcciones'],
    queryFn: () => ticketService.getDirecciones(),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000,
  });
};

export const useTecnicos = () => {
  return useQuery({
    queryKey: ['tecnicos'],
    queryFn: () => ticketService.getTecnicos(),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000,
  });
};

export const useTicketStats = () => {
  return useQuery({
    queryKey: ['ticketStats'],
    queryFn: () => ticketService.getStats(),
    select: (response) => response.data,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTicketData) => ticketService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        toast.success('Ticket creado exitosamente');
      }
    },
    onError: (error: AxiosErrorResponse) => {
      toast.error(error.response?.data?.message || 'Error al crear ticket');
    },
  });
};

export const useCreateTicketWithFormData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => ticketService.createWithFormData(formData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        toast.success('Ticket creado exitosamente');
      }
    },
    onError: (error: AxiosErrorResponse) => {
      const errorData = error.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorData.errors.forEach((err) => {
          toast.error(err.message || 'Error de validación');
        });
      } else {
        toast.error(errorData?.message || 'Error al crear ticket');
      }
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketData }) =>
      ticketService.update(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
        toast.success('Ticket actualizado exitosamente');
      }
    },
    onError: (error: AxiosErrorResponse) => {
      toast.error(error.response?.data?.message || 'Error al actualizar ticket');
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketService.delete(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        toast.success('Ticket eliminado exitosamente');
      }
    },
    onError: () => {
      toast.error('Error al eliminar ticket');
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CommentData }) =>
      ticketService.addComment(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
        toast.success('Comentario agregado exitosamente');
      }
    },
    onError: (error: AxiosErrorResponse) => {
      const errorData = error.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorData.errors.forEach((err) => {
          toast.error(err.message || 'Error de validación');
        });
      } else {
        toast.error(errorData?.message || 'Error al agregar comentario');
      }
    },
  });
};

export const useStartProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketService.startProgress(id),
    onSuccess: (response, id) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        queryClient.invalidateQueries({ queryKey: ['ticket', id] });
        toast.success('Ticket marcado como "En Proceso"');
      }
    },
    onError: (error: AxiosErrorResponse) => {
      toast.error(error.response?.data?.message || 'Error al iniciar progreso');
    },
  });
};

export const useMarkAsResolved = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketService.markAsResolved(id),
    onSuccess: (response, id) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        queryClient.invalidateQueries({ queryKey: ['ticket', id] });
        toast.success('Ticket marcado como "Resuelto"');
      }
    },
    onError: (error: AxiosErrorResponse) => {
      toast.error(error.response?.data?.message || 'Error al marcar como resuelto');
    },
  });
};
