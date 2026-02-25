import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  toolService,
  type CreateToolData,
  type UpdateToolData,
  type AssignToolData,
} from '../services/toolService';
import type { ToolFilters, AxiosErrorResponse } from '../types';
import { toast } from 'react-toastify';
import { useTecnicos as useTecnicosFromTickets } from './useTickets';

export const useTools = (filters?: ToolFilters) => {
  return useQuery({
    queryKey: ['tools', filters],
    queryFn: () => toolService.getAll(filters),
    select: (response) => response.data,
  });
};

export const useToolById = (id: number | undefined) => {
  return useQuery({
    queryKey: ['tools', id],
    queryFn: () => toolService.getById(id!),
    enabled: !!id,
    select: (response) => response.data,
  });
};

export const useToolTypes = () => {
  return useQuery({
    queryKey: ['toolTypes'],
    queryFn: () => toolService.getTypes(),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000,
  });
};

export const useToolStatuses = () => {
  return useQuery({
    queryKey: ['toolStatuses'],
    queryFn: () => toolService.getStatuses(),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000,
  });
};

export const useToolStats = () => {
  return useQuery({
    queryKey: ['toolStats'],
    queryFn: () => toolService.getStats(),
    select: (response) => response.data,
  });
};

export const useCreateTool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateToolData) => toolService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tools'] });
        queryClient.invalidateQueries({ queryKey: ['toolStats'] });
        toast.success('Herramienta creada exitosamente');
      }
    },
    onError: (error: AxiosErrorResponse) => {
      const errorData = error.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorData.errors.forEach((err) => {
          toast.error(err.message || 'Error de validación');
        });
      } else {
        const errorMessage = errorData?.message || error.message || 'Error al crear herramienta';
        toast.error(errorMessage);
        console.error('Error completo al crear herramienta:', error);
      }
    },
  });
};

export const useUpdateTool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateToolData }) =>
      toolService.update(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tools'] });
        queryClient.invalidateQueries({ queryKey: ['tools', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['toolStats'] });
        toast.success('Herramienta actualizada exitosamente');
      }
    },
    onError: (error: AxiosErrorResponse) => {
      const errorData = error.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorData.errors.forEach((err) => {
          toast.error(err.message || 'Error de validación');
        });
      } else {
        toast.error(errorData?.message || 'Error al actualizar herramienta');
      }
    },
  });
};

export const useDeleteTool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => toolService.delete(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tools'] });
        queryClient.invalidateQueries({ queryKey: ['toolStats'] });
        toast.success('Herramienta eliminada exitosamente');
      }
    },
    onError: (error: AxiosErrorResponse) => {
      toast.error(error.response?.data?.message || 'Error al eliminar herramienta');
    },
  });
};

export const useAssignTool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssignToolData }) =>
      toolService.assign(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tools'] });
        queryClient.invalidateQueries({ queryKey: ['tools', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['toolStats'] });
        toast.success('Herramienta asignada exitosamente');
      }
    },
    onError: (error: AxiosErrorResponse) => {
      toast.error(error.response?.data?.message || 'Error al asignar herramienta');
    },
  });
};

export const useUnassignTool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => toolService.unassign(id),
    onSuccess: (response, id) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['tools'] });
        queryClient.invalidateQueries({ queryKey: ['tools', id] });
        queryClient.invalidateQueries({ queryKey: ['toolStats'] });
        toast.success('Herramienta desasignada exitosamente');
      }
    },
    onError: (error: AxiosErrorResponse) => {
      toast.error(error.response?.data?.message || 'Error al desasignar herramienta');
    },
  });
};

export const useTecnicos = () => {
  return useTecnicosFromTickets();
};

