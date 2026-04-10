import api from './axios';
import { ApiResponse, Itinerary } from '../types';

export const aiApi = {
  generateItinerary: async (data: {
    destination: string;
    days: number;
    budget: number;
    interests: string[];
    countryPreference?: string;
  }) => {
    const res = await api.post<ApiResponse<Itinerary>>('/itinerary/generate', data);
    return res.data;
  },
};
