import { z } from 'zod';

export const CreatePixTransactionSchema = z.object({
  pixKey: z.string().min(1, 'PIX key is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  description: z.string().optional(),
});

export type CreatePixTransactionDTO = z.infer<typeof CreatePixTransactionSchema>;