import { z } from 'zod';

export const generateItinerarySchema = z.object({
  body: z.object({
    tripId: z.string().uuid().optional(),
    destination: z.string(),
    country: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    budget: z.number().positive().optional(),
    currency: z.string().default('INR'),
    travelStyle: z.string().optional(),
    groupSize: z.number().int().positive().optional(),
    interests: z.array(z.string()).optional(),
    days: z.number().int().positive().optional(),
    countryPreference: z.string().optional(),
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
