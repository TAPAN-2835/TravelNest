import api from './axios';
import { ApiResponse } from '../types';

export interface WeatherForecast {
  date: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pop: number;
  condition: string;
  icon: string;
  iconCode: string;
}

export interface NewsItem {
  title: string;
  link: string;
  snippet: string;
  date: string;
  source: string;
  imageUrl?: string;
}

export interface WeatherAlert {
  tripId: string;
  destination: string;
  startDate: string;
  endDate: string;
  dayForecast: WeatherForecast[];
  nightForecast: WeatherForecast[];
  news?: NewsItem[];
  familyTip?: string;
}

export const alertsApi = {
  getWeatherAlerts: async () => {
    const res = await api.get<ApiResponse<WeatherAlert[]>>('/alerts/weather');
    return res.data;
  },
};
