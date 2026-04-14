import api from './axios';
import { ApiResponse } from '../types';

export interface WeatherForecast {
  date: string;
  temp: number;
  condition: string;
  icon: string;
}

export interface WeatherAlert {
  tripId: string;
  destination: string;
  startDate: string;
  endDate: string;
  forecast: WeatherForecast[];
}

export const alertsApi = {
  getWeatherAlerts: async () => {
    const res = await api.get<ApiResponse<WeatherAlert[]>>('/alerts/weather');
    return res.data;
  },
};
