import { z } from 'zod';

export const ListTransactionsSchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  status: z.enum(['CREATED', 'AWAITING_SETTLEMENT', 'SETTLED', 'FAILED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type ListTransactionsDTO = z.infer<typeof ListTransactionsSchema>;