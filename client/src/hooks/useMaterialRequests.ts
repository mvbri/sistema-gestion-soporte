import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  materialRequestService,
  type CreateMaterialRequestData,
} from '../services/materialRequestService';
import type { MaterialRequestFilters } from '../types';

export const useMaterialRequests = (filters?: MaterialRequestFilters) => {
  return useQuery({
    queryKey: ['materialRequests', filters],
    queryFn: () => materialRequestService.getAll(filters),
    select: (response) => response.data,
  });
};

export const useMaterialRequestById = (id: number | undefined) => {
  return useQuery({
    queryKey: ['materialRequest', id],
    queryFn: () => materialRequestService.getById(id!),
    enabled: Boolean(id),
    select: (response) => response.data,
  });
};

export const useCreateMaterialRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaterialRequestData) => materialRequestService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materialRequests'] });
      toast.success('Solicitud de materiales creada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'No se pudo crear la solicitud');
    },
  });
};

export const useApproveMaterialRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      materialRequestService.approve(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materialRequests'] });
      queryClient.invalidateQueries({ queryKey: ['materialRequest', variables.id] });
      toast.success('Solicitud aprobada');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'No se pudo aprobar'),
  });
};

export const useRejectMaterialRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      materialRequestService.reject(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materialRequests'] });
      queryClient.invalidateQueries({ queryKey: ['materialRequest', variables.id] });
      toast.success('Solicitud rechazada');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'No se pudo rechazar'),
  });
};

export const useCancelMaterialRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      materialRequestService.cancel(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materialRequests'] });
      queryClient.invalidateQueries({ queryKey: ['materialRequest', variables.id] });
      toast.success('Solicitud cancelada');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'No se pudo cancelar'),
  });
};

export const useMaterialRequestComments = (id: number | undefined) => {
  return useQuery({
    queryKey: ['materialRequestComments', id],
    queryFn: () => materialRequestService.getComments(id!),
    enabled: Boolean(id),
    select: (response) => response.data,
  });
};

export const useAddMaterialRequestComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, commentText }: { id: number; commentText: string }) =>
      materialRequestService.addComment(id, commentText),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materialRequest', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['materialRequestComments', variables.id] });
      toast.success('Comentario enviado');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'No se pudo comentar'),
  });
};
