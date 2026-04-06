import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    destinationId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(10),
    images: z.array(z.string().url()).optional(),
  }),
});
