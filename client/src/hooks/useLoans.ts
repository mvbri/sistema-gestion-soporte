import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  loanService,
  type CreateLoanRequestData,
  type LoanChecklistPayload,
  type PendingLoanChecklistPayload,
  type ReturnLoanPayload,
} from '../services/loanService';
import type { EquipmentLoanFilters } from '../types';

export const useLoans = (filters?: EquipmentLoanFilters) => {
  return useQuery({
    queryKey: ['equipmentLoans', filters],
    queryFn: () => loanService.getAll(filters),
    select: (response) => response.data,
  });
};

export const useLoanById = (id: number | undefined) => {
  return useQuery({
    queryKey: ['equipmentLoan', id],
    queryFn: () => loanService.getById(id!),
    enabled: Boolean(id),
    select: (response) => response.data,
  });
};

export const useLoanPools = () => {
  return useQuery({
    queryKey: ['equipmentLoanPools'],
    queryFn: () => loanService.getPools(),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLoanRequestData) => loanService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipmentLoans'] });
      toast.success('Solicitud de préstamo creada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'No se pudo crear la solicitud');
    },
  });
};

export const useApproveLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) => loanService.approve(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipmentLoans'] });
      queryClient.invalidateQueries({ queryKey: ['equipmentLoan', variables.id] });
      toast.success('Préstamo aprobado');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'No se pudo aprobar'),
  });
};

export const useRejectLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => loanService.reject(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipmentLoans'] });
      queryClient.invalidateQueries({ queryKey: ['equipmentLoan', variables.id] });
      toast.success('Préstamo rechazado');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'No se pudo rechazar'),
  });
};

export const useDeliverLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LoanChecklistPayload }) =>
      loanService.deliver(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipmentLoans'] });
      queryClient.invalidateQueries({ queryKey: ['equipmentLoan', variables.id] });
      toast.success('Entrega registrada');
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.message || 'No se pudo registrar la entrega'),
  });
};

export const useReturnLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReturnLoanPayload }) =>
      loanService.returnLoan(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipmentLoans'] });
      queryClient.invalidateQueries({ queryKey: ['equipmentLoan', variables.id] });
      toast.success('Devolución registrada');
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.message || 'No se pudo registrar la devolución'),
  });
};

export const useUpdatePendingLoanChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PendingLoanChecklistPayload }) =>
      loanService.updatePendingChecklist(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipmentLoan', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['equipmentLoans'] });
      toast.success('Checklist actualizado');
    },
    onError: (error: any) =>
      toast.error(error.response?.data?.message || 'No se pudo actualizar el checklist'),
  });
};

export const useCancelLoan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) => loanService.cancel(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipmentLoans'] });
      queryClient.invalidateQueries({ queryKey: ['equipmentLoan', variables.id] });
      toast.success('Préstamo cancelado');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'No se pudo cancelar'),
  });
};

export const useLoansSummaryReport = (dateFrom: string, dateTo: string) => {
  return useQuery({
    queryKey: ['reports', 'loans', dateFrom, dateTo],
    queryFn: () => loanService.getSummaryReport(dateFrom, dateTo),
    enabled: Boolean(dateFrom && dateTo && dateFrom <= dateTo),
  });
};
