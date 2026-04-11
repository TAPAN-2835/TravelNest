import api from './axios';
import { ApiResponse } from '../types';

export interface Destination {
    id: string;
    name: string;
    country: string;
    continent?: string;
    imageUrl: string;
    avgCostPerDay: number;
    description?: string;
    tags?: string[];
}

export const destinationsApi = {
    getDestinations: async (params?: any) => {
        const res = await api.get<ApiResponse<Destination[]>>('/destinations', { params });
        return res.data;
    },
    getById: async (id: string) => {
        const res = await api.get<ApiResponse<Destination>>(`/destinations/${id}`);
        return res.data;
    }
};
