import api from './axios';
import { ApiResponse } from '../types';

export interface AdminStatsData {
  totalUsers: number;
  totalTrips: number;
  totalBookings: number;
  topDestination: string;
  totalRevenue: number;
  newSignups: number;
  topDestinations: {
    id: string;
    name: string;
    country: string;
    bookings: number;
  }[];
  recentUsers: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    role: string;
  }[];
  recentTrips: {
    id: string;
    title: string;
    createdAt: string;
    status: string;
    user: { name: string };
    destination: { name: string };
  }[];
}

export interface AdminUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  totalTrips: number;
  createdAt: string;
}

export interface AdminUserDetailData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  trips: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    totalBudget: number;
    status: string;
    destination: { name: string; country: string };
  }[];
}

export interface AdminTripData {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  destination: { name: string; country: string };
}

export interface AdminAnalyticsData {
  timeSeries: {
    date: string;
    users: number;
    bookings: number;
    revenue: number;
  }[];
}

export const adminApi = {
  getStats: async () => {
    const res = await api.get<ApiResponse<AdminStatsData>>('/admin/stats');
    return res.data;
  },
  getAnalytics: async () => {
    const res = await api.get<ApiResponse<AdminAnalyticsData>>('/admin/analytics');
    return res.data;
  },
  getUsers: async (params?: { search?: string; page?: number }) => {
    const res = await api.get<ApiResponse<AdminUserData[]>>('/admin/users', { params });
    return res.data;
  },
  getUserById: async (id: string) => {
    const res = await api.get<ApiResponse<AdminUserDetailData>>(`/admin/users/${id}`);
    return res.data;
  },
  getTrips: async (params?: { status?: string; page?: number }) => {
    const res = await api.get<ApiResponse<AdminTripData[]>>('/admin/trips', { params });
    return res.data;
  },
  updateUserRole: async (id: string, role: string) => {
    const res = await api.patch(`/admin/users/${id}/role`, { role });
    return res.data;
  },
};
