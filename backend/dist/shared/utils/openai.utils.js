"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeSentimentAI = exports.generateItineraryAI = void 0;
const axios_1 = __importDefault(require("axios"));
const response_utils_1 = require("./response.utils");
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:8000';
const generateItineraryAI = async (data) => {
    try {
        const response = await axios_1.default.post(`${AI_SERVICE_URL}/generate`, data);
        const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        // Support both old flat format and new { success, data } format
        if (result.success && result.data) {
            const data = result.data;
            return {
                ...data,
                days: data.itinerary || data.days, // Map 'itinerary' back to 'days'
                totalEstimatedCost: data.totalEstimatedCost || data.total_estimated_cost
            };
        }
        return result;
    }
    catch (error) {
        console.error('AI Service Error (Generate):', error.response?.data || error.message);
        throw new response_utils_1.AppError('AI Service unavailable', 503);
    }
};
exports.generateItineraryAI = generateItineraryAI;
const analyzeSentimentAI = async (text) => {
    try {
        const response = await axios_1.default.post(`${AI_SERVICE_URL}/analyze-sentiment`, { text });
        return typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    }
    catch (error) {
        console.error('AI Service Error (Sentiment):', error.response?.data || error.message);
        throw new response_utils_1.AppError('Sentiment Analysis Service unavailable', 503);
    }
};
exports.analyzeSentimentAI = analyzeSentimentAI;
//# sourceMappingURL=openai.utils.js.map