import { z } from 'zod';

export const generateItinerarySchema = z.object({
  body: z.object({
    tripId: z.string().uuid(),
    destination: z.string(),
    country: z.string(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    budget: z.number().positive(),
    currency: z.string().default('INR'),
    travelStyle: z.string(),
    groupSize: z.number().int().positive(),
    interests: z.array(z.string()),
  }),
});

export const updateItineraryDaySchema = z.object({
  body: z.object({
    morning: z.any().optional(),
    afternoon: z.any().optional(),
    evening: z.any().optional(),
    accommodation: z.any().optional(),
    tips: z.array(z.string()).optional(),
  }),
});

export const regenerateItinerarySchema = z.object({
  body: z.object({
    feedback: z.string(),
  }),
});
