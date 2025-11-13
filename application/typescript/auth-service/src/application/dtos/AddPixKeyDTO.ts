import { z } from 'zod';

export const AddPixKeySchema = z.object({
  pixKey: z.string().min(1, 'PIX key is required'),
  pixKeyType: z.enum(['CPF', 'EMAIL', 'PHONE', 'RANDOM']),
});

export type AddPixKeyDTO = z.infer<typeof AddPixKeySchema>;