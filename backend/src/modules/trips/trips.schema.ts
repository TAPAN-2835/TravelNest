import { z } from 'zod';

export const createTripSchema = z.object({
  body: z.object({
    destinationId: z.string().uuid(),
    title: z.string().min(2),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    totalBudget: z.number().positive(),
    currency: z.string().default('INR'),
    groupSize: z.number().int().positive().default(1),
    travelStyle: z.string(),
  }),
});

export const updateTripSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    status: z.enum(['PLANNING', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
    notes: z.string().optional(),
    coverImage: z.string().url().optional(),
  }),
});

export const updateTripStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PLANNING', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
  }),
});
