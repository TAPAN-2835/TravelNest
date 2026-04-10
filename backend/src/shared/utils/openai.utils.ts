import axios from 'axios';
import { AppError } from './response.utils';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:8000';

export const generateItineraryAI = async (data: {
  destination: string;
  days: number;
  budget: number;
  interests: string[];
  countryPreference?: string;
}) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/generate`, data);
    const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

    // Support both old flat format and new { success, data } format
    if (result.success && result.data) {
      const data = result.data;
      return {
        ...data,
        days: data.itinerary || data.days, // Map 'itinerary' back to 'days'
        totalEstimatedCost: data.totalEstimatedCost || (data as any).total_estimated_cost
      };
    }
    return result;
  } catch (error: any) {
    console.error('AI Service Error (Generate):', error.response?.data || error.message);
    throw new AppError('AI Service unavailable', 503);
  }
};

export const analyzeSentimentAI = async (text: string) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/analyze-sentiment`, { text });
    return typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
  } catch (error: any) {
    console.error('AI Service Error (Sentiment):', error.response?.data || error.message);
    throw new AppError('Sentiment Analysis Service unavailable', 503);
  }
};
