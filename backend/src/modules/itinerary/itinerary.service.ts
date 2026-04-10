import ItineraryModel from './itinerary.model';
import { generateItineraryAI } from '../../shared/utils/openai.utils';
import { prisma } from '../../config/database';
import { AppError } from '../../shared/utils/response.utils';
import { setCachedData, getCachedData, invalidateCache } from '../../shared/utils/cache.utils';
import { io } from '../../config/socket';

export class ItineraryService {
  static async generate(userId: string, data: any) {
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

      const itinerary = await ItineraryModel.create({
        tripId: tripId || `temp_${Date.now()}`,
        userId,
        destination,
        duration: result.days.length,
        ...result,
      });

      if (tripId) {
        await prisma.trip.update({
          where: { id: tripId },
          data: { itineraryId: (itinerary as any)._id.toString() },
        });
      }

      await setCachedData(`itinerary:${(itinerary as any).tripId}`, itinerary, 86400); // 24h cache

      io.to(`trip:${tripId}`).emit('itinerary:ready', { itinerary });

      return itinerary;
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw new AppError('Failed to generate itinerary. Please try again.', 503);
    }
  }

  static async getByTripId(tripId: string) {
    const cached = await getCachedData(`itinerary:${tripId}`);
    if (cached) return cached;

    const itinerary = await ItineraryModel.findOne({ tripId });
    if (!itinerary) throw new AppError('Itinerary not found', 404);

    await setCachedData(`itinerary:${tripId}`, itinerary, 86400);
    return itinerary;
  }

  static async updateDay(tripId: string, dayNumber: number, updateData: any) {
    const itinerary = await ItineraryModel.findOneAndUpdate(
      { tripId, 'days.day': dayNumber },
      { $set: { 'days.$': { ...updateData, day: dayNumber } } },
      { new: true }
    );

    if (!itinerary) throw new AppError('Itinerary or day not found', 404);

    await setCachedData(`itinerary:${tripId}`, itinerary, 86400);
    return itinerary;
  }

  static async delete(tripId: string) {
    await ItineraryModel.findOneAndDelete({ tripId });
    await prisma.trip.update({
      where: { id: tripId },
      data: { itineraryId: null },
    });
    await invalidateCache(`itinerary:${tripId}`);
  }

  static async regenerate(userId: string, tripId: string, feedback: string) {
    const existing = await ItineraryModel.findOne({ tripId });
    if (!existing) throw new AppError('Existing itinerary not found', 404);

    const result = await this.callAIWithRetry({
      destination: existing.destination,
      days: existing.duration,
      budget: existing.totalEstimatedCost,
      interests: (existing as any).prompt ? [(existing as any).prompt] : ['general sightseeing'],
      feedback,
    });

    const updated = await ItineraryModel.findOneAndUpdate(
      { tripId },
      { $set: { ...result, generatedAt: new Date() } },
      { new: true }
    );

    await setCachedData(`itinerary:${tripId}`, updated, 86400);
    return updated;
  }

  private static async callAIWithRetry(
    data: {
      destination: string;
      days: number;
      budget: number;
      interests: string[];
      countryPreference?: string;
      feedback?: string;
    },
    retries = 3
  ) {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await generateItineraryAI(data);
      } catch (error: any) {
        attempt++;
        if (attempt === retries) throw error;
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
}
