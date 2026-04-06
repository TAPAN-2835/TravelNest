import { z } from 'zod';

export const createExpenseSchema = z.object({
  body: z.object({
    category: z.enum(['FLIGHTS', 'HOTELS', 'FOOD', 'ACTIVITIES', 'TRANSPORT', 'SHOPPING', 'MISC']),
    description: z.string(),
    amount: z.number().positive(),
    date: z.string().datetime(),
    receiptUrl: z.string().url().optional(),
  }),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const updateBudgetTotalSchema = z.object({
  body: z.object({
    totalAmount: z.number().positive(),
    currency: z.string(),
  }),
});
