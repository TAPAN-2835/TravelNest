import api from './axios';
import { User, ApiResponse } from '../types';

export const authApi = {
  login: async (data: any) => {
    const res = await api.post<ApiResponse<{ accessToken: string; user: User }>>('/auth/login', data);
    return res.data;
  },
  register: async (data: any) => {
    const res = await api.post<ApiResponse<{ accessToken: string; user: User }>>('/auth/register', data);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data;
  },
};
