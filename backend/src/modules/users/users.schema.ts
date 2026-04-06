import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    nationality: z.string().optional(),
    travelStyle: z.array(z.string()).optional(),
  }),
});
