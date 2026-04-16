"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItineraryService = void 0;
const itinerary_model_1 = __importDefault(require("./itinerary.model"));
const openai_utils_1 = require("../../shared/utils/openai.utils");
const database_1 = require("../../config/database");
const response_utils_1 = require("../../shared/utils/response.utils");
const cache_utils_1 = require("../../shared/utils/cache.utils");
const socket_1 = require("../../config/socket");
class ItineraryService {
    static async generate(userId, data) {
        const { tripId, destination, country, startDate, endDate, budget, currency, travelStyle, groupSize, interests } = data;
        let days = data.days;
        if (!days && startDate && endDate) {
            days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
        }
        days = days || 3;
        try {
            const result = await this.callAIWithRetry({
                destination,
                days,
                budget,
                interests,
                countryPreference: data.countryPreference || 'international',
            });
            const itinerary = await itinerary_model_1.default.create({
                tripId: tripId || `temp_${Date.now()}`,
                userId,
                destination,
                duration: result.days.length,
                ...result,
            });
            if (tripId) {
                await database_1.prisma.trip.update({
                    where: { id: tripId },
                    data: { itineraryId: itinerary._id.toString() },
                });
            }
            await (0, cache_utils_1.setCachedData)(`itinerary:${itinerary.tripId}`, itinerary, 86400); // 24h cache
            socket_1.io.to(`trip:${tripId}`).emit('itinerary:ready', { itinerary });
            return itinerary;
        }
        catch (error) {
            console.error('AI Generation Error:', error);
            throw new response_utils_1.AppError('Failed to generate itinerary. Please try again.', 503);
        }
    }
    static async getByTripId(tripId) {
        const cached = await (0, cache_utils_1.getCachedData)(`itinerary:${tripId}`);
        if (cached)
            return cached;
        const itinerary = await itinerary_model_1.default.findOne({ tripId });
        if (!itinerary)
            throw new response_utils_1.AppError('Itinerary not found', 404);
        await (0, cache_utils_1.setCachedData)(`itinerary:${tripId}`, itinerary, 86400);
        return itinerary;
    }
    static async updateDay(tripId, dayNumber, updateData) {
        const itinerary = await itinerary_model_1.default.findOneAndUpdate({ tripId, 'days.day': dayNumber }, { $set: { 'days.$': { ...updateData, day: dayNumber } } }, { new: true });
        if (!itinerary)
            throw new response_utils_1.AppError('Itinerary or day not found', 404);
        await (0, cache_utils_1.setCachedData)(`itinerary:${tripId}`, itinerary, 86400);
        return itinerary;
    }
    static async delete(tripId) {
        await itinerary_model_1.default.findOneAndDelete({ tripId });
        await database_1.prisma.trip.update({
            where: { id: tripId },
            data: { itineraryId: null },
        });
        await (0, cache_utils_1.invalidateCache)(`itinerary:${tripId}`);
    }
    static async regenerate(userId, tripId, feedback) {
        const existing = await itinerary_model_1.default.findOne({ tripId });
        if (!existing)
            throw new response_utils_1.AppError('Existing itinerary not found', 404);
        const result = await this.callAIWithRetry({
            destination: existing.destination,
            days: existing.duration,
            budget: existing.totalEstimatedCost,
            interests: existing.prompt ? [existing.prompt] : ['general sightseeing'],
            feedback,
        });
        const updated = await itinerary_model_1.default.findOneAndUpdate({ tripId }, { $set: { ...result, generatedAt: new Date() } }, { new: true });
        await (0, cache_utils_1.setCachedData)(`itinerary:${tripId}`, updated, 86400);
        return updated;
    }
    static async callAIWithRetry(data, retries = 3) {
        let attempt = 0;
        while (attempt < retries) {
            try {
                return await (0, openai_utils_1.generateItineraryAI)(data);
            }
            catch (error) {
                attempt++;
                if (attempt === retries)
                    throw error;
                // Exponential backoff
                await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }
}
exports.ItineraryService = ItineraryService;
//# sourceMappingURL=itinerary.service.js.map