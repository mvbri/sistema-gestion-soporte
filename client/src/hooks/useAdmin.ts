import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, type CreateCategoriaData, type UpdateCategoriaData, type CreatePrioridadData, type UpdatePrioridadData, type CreateDireccionData, type UpdateDireccionData, type DireccionesFilters, type CreateEquipmentTypeData, type UpdateEquipmentTypeData, type CreateConsumableTypeData, type UpdateConsumableTypeData } from '../services/adminService';
import { toast } from 'react-toastify';

export const useAdminCategorias = () => {
  return useQuery({
    queryKey: ['adminCategorias'],
    queryFn: () => adminService.getCategorias(),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminPrioridades = () => {
  return useQuery({
    queryKey: ['adminPrioridades'],
    queryFn: () => adminService.getPrioridades(),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoriaData) => adminService.createCategoria(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminCategorias'] });
        queryClient.invalidateQueries({ queryKey: ['categorias'] });
        toast.success('Categoría creada exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear categoría');
    },
  });
};

export const useUpdateCategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoriaData }) =>
      adminService.updateCategoria(id, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminCategorias'] });
        queryClient.invalidateQueries({ queryKey: ['categorias'] });
        toast.success('Categoría actualizada exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar categoría');
    },
  });
};

export const useDeleteCategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.deleteCategoria(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminCategorias'] });
        queryClient.invalidateQueries({ queryKey: ['categorias'] });
        toast.success('Categoría eliminada exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar categoría');
    },
  });
};

export const useCreatePrioridad = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePrioridadData) => adminService.createPrioridad(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminPrioridades'] });
        queryClient.invalidateQueries({ queryKey: ['prioridades'] });
        toast.success('Prioridad creada exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear prioridad');
    },
  });
};

export const useUpdatePrioridad = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePrioridadData }) =>
      adminService.updatePrioridad(id, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminPrioridades'] });
        queryClient.invalidateQueries({ queryKey: ['prioridades'] });
        toast.success('Prioridad actualizada exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar prioridad');
    },
  });
};

export const useDeletePrioridad = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.deletePrioridad(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminPrioridades'] });
        queryClient.invalidateQueries({ queryKey: ['prioridades'] });
        toast.success('Prioridad eliminada exitosamente');
      }
    },
    onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Error al eliminar prioridad');
    },
  });
};

export const useAdminDirecciones = (filters?: DireccionesFilters) => {
  return useQuery({
    queryKey: ['adminDirecciones', filters],
    queryFn: () => adminService.getDirecciones(filters),
    select: (response) => {
      if (response?.data) {
        return response.data;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateDireccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDireccionData) => adminService.createDireccion(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminDirecciones'] });
        queryClient.invalidateQueries({ queryKey: ['direcciones'] });
        toast.success('Dirección creada exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear dirección');
    },
  });
};

export const useUpdateDireccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDireccionData }) =>
      adminService.updateDireccion(id, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminDirecciones'] });
        queryClient.invalidateQueries({ queryKey: ['direcciones'] });
        toast.success('Dirección actualizada exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar dirección');
    },
  });
};

export const useDeleteDireccion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.deleteDireccion(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminDirecciones'] });
        queryClient.invalidateQueries({ queryKey: ['direcciones'] });
        toast.success('Dirección eliminada exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar dirección');
    },
  });
};

export const useAdminEquipmentTypes = () => {
  return useQuery({
    queryKey: ['adminEquipmentTypes'],
    queryFn: () => adminService.getEquipmentTypes(),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateEquipmentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEquipmentTypeData) => adminService.createEquipmentType(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminEquipmentTypes'] });
        queryClient.invalidateQueries({ queryKey: ['equipmentTypes'] });
        toast.success('Tipo de equipo creado exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear tipo de equipo');
    },
  });
};

export const useUpdateEquipmentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEquipmentTypeData }) =>
      adminService.updateEquipmentType(id, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminEquipmentTypes'] });
        queryClient.invalidateQueries({ queryKey: ['equipmentTypes'] });
        toast.success('Tipo de equipo actualizado exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar tipo de equipo');
    },
  });
};

export const useDeleteEquipmentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.deleteEquipmentType(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminEquipmentTypes'] });
        queryClient.invalidateQueries({ queryKey: ['equipmentTypes'] });
        toast.success('Tipo de equipo eliminado exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar tipo de equipo');
    },
  });
};

export const useAdminConsumableTypes = () => {
  return useQuery({
    queryKey: ['adminConsumableTypes'],
    queryFn: () => adminService.getConsumableTypes(),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateConsumableType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConsumableTypeData) => adminService.createConsumableType(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminConsumableTypes'] });
        queryClient.invalidateQueries({ queryKey: ['consumableTypes'] });
        toast.success('Tipo de consumible creado exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear tipo de consumible');
    },
  });
};

export const useUpdateConsumableType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateConsumableTypeData }) =>
      adminService.updateConsumableType(id, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminConsumableTypes'] });
        queryClient.invalidateQueries({ queryKey: ['consumableTypes'] });
        toast.success('Tipo de consumible actualizado exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar tipo de consumible');
    },
  });
};

export const useDeleteConsumableType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => adminService.deleteConsumableType(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['adminConsumableTypes'] });
        queryClient.invalidateQueries({ queryKey: ['consumableTypes'] });
        toast.success('Tipo de consumible eliminado exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar tipo de consumible');
    },
  });
};
