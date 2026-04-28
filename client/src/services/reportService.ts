import api from '../utils/api';
import type { ApiResponse, TicketsPeriodReport } from '../types';

export const reportService = {
  async getTicketsReport(dateFrom: string, dateTo: string): Promise<TicketsPeriodReport> {
    const response = await api.get<ApiResponse<TicketsPeriodReport>>('/reports/tickets', {
      params: { date_from: dateFrom, date_to: dateTo },
    });
    if (!response.data.success || response.data.data === undefined) {
      throw new Error(response.data.message || 'Error al cargar el reporte');
    }
    return response.data.data;
  },
};
