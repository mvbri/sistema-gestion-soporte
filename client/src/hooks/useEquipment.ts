import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  equipmentService,
  type CreateEquipmentData,
  type UpdateEquipmentData,
  type AssignEquipmentData
} from '../services/equipmentService';
import type { EquipmentFilters } from '../types';
import { toast } from 'react-toastify';
import { useTecnicos as useTecnicosFromTickets } from './useTickets';

export const useEquipment = (filters?: EquipmentFilters) => {
  return useQuery({
    queryKey: ['equipment', filters],
    queryFn: () => equipmentService.getAll(filters),
    select: (response) => response.data,
  });
};

export const useEquipmentById = (id: number | undefined) => {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentService.getById(id!),
    enabled: !!id,
    select: (response) => response.data,
  });
};

export const useEquipmentTypes = () => {
  return useQuery({
    queryKey: ['equipmentTypes'],
    queryFn: () => equipmentService.getTypes(),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000,
  });
};

export const useEquipmentStatuses = () => {
  return useQuery({
    queryKey: ['equipmentStatuses'],
    queryFn: () => equipmentService.getStatuses(),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000,
  });
};

export const useEquipmentStats = () => {
  return useQuery({
    queryKey: ['equipmentStats'],
    queryFn: () => equipmentService.getStats(),
    select: (response) => response.data,
  });
};

export const useCreateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEquipmentData) => equipmentService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['equipment'] });
        queryClient.invalidateQueries({ queryKey: ['equipmentStats'] });
        toast.success('Equipo creado exitosamente');
      }
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorData.errors.forEach((err: any) => {
          toast.error(err.message || 'Error de validación');
        });
      } else {
        const errorMessage = errorData?.message || error.message || 'Error al crear equipo';
        toast.error(errorMessage);
        console.error('Error completo al crear equipo:', error);
      }
    },
  });
};

export const useUpdateEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEquipmentData }) =>
      equipmentService.update(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['equipment'] });
        queryClient.invalidateQueries({ queryKey: ['equipment', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['equipmentStats'] });
        toast.success('Equipo actualizado exitosamente');
      }
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        errorData.errors.forEach((err: any) => {
          toast.error(err.message || 'Error de validación');
        });
      } else {
        toast.error(errorData?.message || 'Error al actualizar equipo');
      }
    },
  });
};

export const useDeleteEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => equipmentService.delete(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['equipment'] });
        queryClient.invalidateQueries({ queryKey: ['equipmentStats'] });
        toast.success('Equipo eliminado exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar equipo');
    },
  });
};

export const useAssignEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssignEquipmentData }) =>
      equipmentService.assign(id, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['equipment'] });
        queryClient.invalidateQueries({ queryKey: ['equipment', variables.id] });
        queryClient.invalidateQueries({ queryKey: ['equipmentStats'] });
        toast.success('Equipo asignado exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al asignar equipo');
    },
  });
};

export const useUnassignEquipment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => equipmentService.unassign(id),
    onSuccess: (response, id) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['equipment'] });
        queryClient.invalidateQueries({ queryKey: ['equipment', id] });
        queryClient.invalidateQueries({ queryKey: ['equipmentStats'] });
        toast.success('Equipo desasignado exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al desasignar equipo');
    },
  });
};

export const useTecnicos = () => {
  return useTecnicosFromTickets();
};
