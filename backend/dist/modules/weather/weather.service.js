"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherService = void 0;
const axios_1 = __importDefault(require("axios"));
const CACHE_MINUTES = 15;
const cache = {};
class WeatherService {
    static async getWeatherForecast(city, startDate, endDate) {
        const cacheKey = city.toLowerCase();
        const now = Date.now();
        if (cache[cacheKey] && (now - cache[cacheKey].timestamp) < CACHE_MINUTES * 60 * 1000) {
            const cached = cache[cacheKey].data;
            return {
                day: this.filterByDates(cached.day, startDate, endDate),
                night: this.filterByDates(cached.night, startDate, endDate)
            };
        }
        try {
            const response = await axios_1.default.get(this.BASE_URL, {
                params: {
                    q: city,
                    appid: this.API_KEY,
                    units: 'metric'
                }
            });
            const allForecasts = response.data.list.map((item) => ({
                date: item.dt_txt.split(' ')[0],
                time: item.dt_txt.split(' ')[1],
                temp: Math.round(item.main.temp),
                feelsLike: Math.round(item.main.feels_like),
                humidity: item.main.humidity,
                windSpeed: item.wind.speed,
                pop: Math.round(item.pop * 100), // Convert 0-1 to percentage
                condition: item.weather[0].main,
                icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
                iconCode: item.weather[0].icon
            }));
            // Categorize into Day (closest to 15:00) and Night (closest to 03:00)
            const dayMap = new Map();
            const nightMap = new Map();
            for (const f of allForecasts) {
                // Day logic: 12:00 or 15:00 preference
                if (f.time === "12:00:00" || f.time === "15:00:00") {
                    dayMap.set(f.date, f);
                }
                // Night logic: 00:00 or 03:00 preference
                if (f.time === "00:00:00" || f.time === "03:00:00" || f.time === "21:00:00") {
                    if (!nightMap.has(f.date) || f.time === "00:00:00") {
                        nightMap.set(f.date, f);
                    }
                }
            }
            // Fallback for dates that might miss specific slots due to 3h granularity gaps
            const uniqueDates = [...new Set(allForecasts.map(f => f.date))];
            for (const date of uniqueDates) {
                if (!dayMap.has(date)) {
                    const someEntry = allForecasts.find(f => f.date === date);
                    if (someEntry)
                        dayMap.set(date, someEntry);
                }
                if (!nightMap.has(date)) {
                    const someEntry = allForecasts.find(f => f.date === date);
                    if (someEntry)
                        nightMap.set(date, someEntry);
                }
            }
            const result = {
                day: this.filterByDates([...dayMap.values()], startDate, endDate),
                night: this.filterByDates([...nightMap.values()], startDate, endDate)
            };
            // Save complete sets to cache (before date filtering for multi-trip reuse)
            cache[cacheKey] = {
                data: {
                    day: [...dayMap.values()],
                    night: [...nightMap.values()]
                },
                timestamp: now
            };
            return result;
        }
        catch (error) {
            console.error(`Error fetching weather for ${city}:`, error.message);
            return { day: [], night: [] };
        }
    }
    static filterByDates(data, start, end) {
        const s = new Date(start).toISOString().split('T')[0];
        const e = new Date(end).toISOString().split('T')[0];
        return data.filter(f => f.date >= s && f.date <= e);
    }
}
exports.WeatherService = WeatherService;
WeatherService.API_KEY = process.env.OPENWEATHER_API_KEY;
WeatherService.BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';
//# sourceMappingURL=weather.service.js.map