import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/authService';
import type { DireccionTicket } from '../types';

export const useDireccionesOptions = () => {
  return useQuery({
    queryKey: ['direcciones-public'],
    queryFn: () => authService.getDirecciones(),
    select: (response) => (response.data as DireccionTicket[]) ?? [],
    staleTime: 10 * 60 * 1000,
  });
};

