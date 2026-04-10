import api from './axios';
import { ApiResponse } from '../types';

export interface Destination {
    id: string;
    name: string;
    country: string;
    imageUrl: string;
    avgCostPerDay: number;
}

export const destinationsApi = {
    getDestinations: async () => {
        const res = await api.get<ApiResponse<Destination[]>>('/destinations');
        return res.data;
    },
    getById: async (id: string) => {
        const res = await api.get<ApiResponse<Destination>>(`/destinations/${id}`);
        return res.data;
    }
};
