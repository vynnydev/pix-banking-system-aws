import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  cpf: z.string().length(11, 'CPF must have 11 digits'),
  phone: z.string().min(10, 'Phone must have at least 10 digits'),
});

export type RegisterUserDTO = z.infer<typeof RegisterUserSchema>;