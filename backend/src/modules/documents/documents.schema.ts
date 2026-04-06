import { z } from 'zod';

export const uploadUrlSchema = z.object({
  body: z.object({
    fileName: z.string(),
    fileType: z.string(),
    documentType: z.enum(['PASSPORT', 'VISA', 'TICKET', 'INSURANCE', 'HOTEL_VOUCHER', 'OTHER']),
    tripId: z.string().uuid().optional(),
  }),
});

export const confirmUploadSchema = z.object({
  body: z.object({
    documentId: z.string().uuid(),
    fileSize: z.number().int().positive(),
  }),
});
