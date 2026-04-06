import { z } from 'zod';

export const createDestinationSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    country: z.string(),
    continent: z.string(),
    description: z.string(),
    imageUrl: z.string().url(),
    avgCostPerDay: z.number().positive(),
    bestSeason: z.array(z.string()),
    tags: z.array(z.string()),
    latitude: z.number(),
    longitude: z.number(),
  }),
});

export const updateDestinationSchema = createDestinationSchema.partial();
