import api from './axios';
import { ApiResponse } from '../types';

export const budgetApi = {
  getBudget: async (tripId: string) => {
    const res = await api.get<ApiResponse<any>>(`/budget/${tripId}`);
    return res.data;
  },
  addExpense: async (tripId: string, data: any) => {
    const res = await api.post<ApiResponse<any>>(`/budget/${tripId}/expense`, data);
    return res.data;
  },
  deleteExpense: async (tripId: string, expenseId: string) => {
    const res = await api.delete<ApiResponse<any>>(`/budget/${tripId}/expense/${expenseId}`);
    return res.data;
  },
};
