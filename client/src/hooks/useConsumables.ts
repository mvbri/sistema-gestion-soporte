import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  consumableService,
  type CreateConsumableData as CreateConsumablePayload,
  type UpdateConsumableData as UpdateConsumablePayload,
} from '../services/consumableService';
import type { ConsumableFilters } from '../types';
import { toast } from 'react-toastify';

export const useConsumables = (filters?: ConsumableFilters) => {
  return useQuery({
    queryKey: ['consumables', filters],
    queryFn: () => consumableService.getAll(filters),
    select: (response) => response.data,
  });
};

export const useConsumableById = (id: number | undefined) => {
  return useQuery({
    queryKey: ['consumables', id],
    queryFn: () => consumableService.getById(id!),
    enabled: !!id,
    select: (response) => response.data,
  });
};

export const useConsumableTypes = () => {
  return useQuery({
    queryKey: ['consumableTypes'],
    queryFn: () => consumableService.getTypes(),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000,
  });
};

export const useConsumableStatuses = () => {
  return useQuery({
    queryKey: ['consumableStatuses'],
    queryFn: () => consumableService.getStatuses(),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000,
  });
};

export const useConsumableStats = () => {
  return useQuery({
    queryKey: ['consumableStats'],
    queryFn: () => consumableService.getStats(),
    select: (response) => response.data,
  });
};

export const useCreateConsumable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConsumablePayload) => consumableService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['consumables'] });
        queryClient.invalidateQueries({ queryKey: ['consumableStats'] });
        toast.success('Consumible creado exitosamente');
      }
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorData.errors.forEach((err: any) => {
          toast.error(err.message || 'Error de validación');
        });
      } else {
        const errorMessage = errorData?.message || error.message || 'Error al crear consumible';
        toast.error(errorMessage);
        console.error('Error completo al crear consumible:', error);
      }
    },
  });
};

export const useUpdateConsumable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateConsumablePayload }) =>
      consumableService.update(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['consumables'] });
        queryClient.invalidateQueries({ queryKey: ['consumables', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['consumableStats'] });
        toast.success('Consumible actualizado exitosamente');
      }
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorData.errors.forEach((err: any) => {
          toast.error(err.message || 'Error de validación');
        });
      } else {
        toast.error(errorData?.message || 'Error al actualizar consumible');
      }
    },
  });
};

export const useDeleteConsumable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => consumableService.delete(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['consumables'] });
        queryClient.invalidateQueries({ queryKey: ['consumableStats'] });
        toast.success('Consumible eliminado exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar consumible');
    },
  });
};

