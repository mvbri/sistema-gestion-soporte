import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/reportService';

export const useTicketsPeriodReport = (dateFrom: string, dateTo: string) => {
  return useQuery({
    queryKey: ['reports', 'tickets', dateFrom, dateTo],
    queryFn: () => reportService.getTicketsReport(dateFrom, dateTo),
    enabled: Boolean(dateFrom && dateTo && dateFrom <= dateTo),
  });
};
