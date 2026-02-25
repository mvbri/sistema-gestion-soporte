import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backupService, type BackupListFilters } from '../services/backupService';
import { toast } from 'react-toastify';

export const useListBackups = (filters?: BackupListFilters) => {
  return useQuery({
    queryKey: ['backups', filters],
    queryFn: () => backupService.listBackups(filters),
    select: (response) => response.data || { backups: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } },
    staleTime: 30 * 1000,
    retry: 1,
  });
};

export const useGenerateBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => backupService.generateBackup(),
    onSuccess: (blob) => {
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .substring(0, 19);
      const filename = `backup_${timestamp}.sql`;
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      toast.success('Respaldo generado y descargado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al generar el respaldo');
    },
  });
};

export const useRestoreBackup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => backupService.restoreBackup(file),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['backups'] });
        toast.success('Base de datos restaurada exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al restaurar el respaldo');
    },
  });
};

export const useRestoreBackupFromFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (filename: string) => backupService.restoreBackupFromFile(filename),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['backups'] });
        toast.success('Base de datos restaurada exitosamente');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al restaurar el respaldo');
    },
  });
};
