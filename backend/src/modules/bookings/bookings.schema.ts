import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    tripId: z.string().uuid(),
    destinationId: z.string().uuid(),
    type: z.enum(['HOTEL', 'FLIGHT', 'ACTIVITY', 'TRANSPORT']),
    providerName: z.string(),
    checkIn: z.string().datetime().optional(),
    checkOut: z.string().datetime().optional(),
    amount: z.number().positive(),
    currency: z.string().default('INR'),
    details: z.any(),
  }),
});

export const updateBookingSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED']).optional(),
    confirmationNo: z.string().optional(),
    details: z.any().optional(),
  }),
});
