import axios from 'axios';

interface ForecastData {
  date: string;
  temp: number;
  condition: string;
  icon: string;
}

const CACHE_MINUTES = 15;
const cache: { [key: string]: { data: ForecastData[], timestamp: number } } = {};

export class WeatherService {
  private static API_KEY = process.env.OPENWEATHER_API_KEY;
  private static BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

  static async getWeatherForecast(city: string, startDate: Date, endDate: Date): Promise<ForecastData[]> {
    const cacheKey = city.toLowerCase();
    const now = Date.now();

    if (cache[cacheKey] && (now - cache[cacheKey].timestamp) < CACHE_MINUTES * 60 * 1000) {
      return this.filterByDates(cache[cacheKey].data, startDate, endDate);
    }

    try {
      const response = await axios.get(this.BASE_URL, {
        params: {
          q: city,
          appid: this.API_KEY,
          units: 'metric'
        }
      });

      const forecasts: ForecastData[] = response.data.list.map((item: any) => ({
        date: item.dt_txt.split(' ')[0],
        temp: Math.round(item.main.temp),
        condition: item.weather[0].main,
        icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`
      }));

      // Group by day and take one forecast per day (e.g. at noon or first available)
      const dailyForecasts: ForecastData[] = [];
      const seenDates = new Set<string>();

      for (const f of forecasts) {
        if (!seenDates.has(f.date)) {
          dailyForecasts.push(f);
          seenDates.add(f.date);
        }
      }

      cache[cacheKey] = { data: dailyForecasts, timestamp: now };
      
      return this.filterByDates(dailyForecasts, startDate, endDate);
    } catch (error: any) {
      console.error(`Error fetching weather for ${city}:`, error.message);
      return [];
    }
  }

  private static filterByDates(data: ForecastData[], start: Date, end: Date): ForecastData[] {
    const s = new Date(start).toISOString().split('T')[0];
    const e = new Date(end).toISOString().split('T')[0];
    
    return data.filter(f => f.date >= s && f.date <= e);
  }
}
