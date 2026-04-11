import api from './axios';
import { ApiResponse, Trip } from '../types';

export const tripsApi = {
  getTrips: async () => {
    const res = await api.get<ApiResponse<Trip[]>>('/trips');
    return res.data;
  },
  createTrip: async (data: any) => {
    const res = await api.post<ApiResponse<Trip>>('/trips', data);
    return res.data;
  },
  saveGeneratedTrip: async (data: any) => {
    const res = await api.post<ApiResponse<Trip>>('/trips/save', data);
    return res.data;
  },
  updateTripStatus: async (id: string, status: string) => {
    const res = await api.patch<ApiResponse<Trip>>(`/trips/${id}/status`, { status });
    return res.data;
  },
  deleteTrip: async (id: string) => {
    const res = await api.delete<ApiResponse<void>>(`/trips/${id}`);
    return res.data;
  },
};
