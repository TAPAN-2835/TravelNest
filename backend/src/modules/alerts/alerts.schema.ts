import { z } from 'zod';

export const subscribeAlertsSchema = z.object({
  body: z.object({
    tripId: z.string().uuid(),
  }),
});

export const broadcastAlertSchema = z.object({
  body: z.object({
    tripIds: z.array(z.string().uuid()),
    title: z.string(),
    message: z.string(),
    type: z.enum(['WEATHER', 'FLIGHT_DELAY', 'TRAVEL_ADVISORY', 'TRIP_REMINDER', 'GENERAL']),
    severity: z.enum(['INFO', 'WARNING', 'CRITICAL']),
  }),
});
