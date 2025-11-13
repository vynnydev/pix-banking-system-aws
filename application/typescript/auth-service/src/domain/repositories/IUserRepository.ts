import { User } from '@pix-banking/shared';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(userId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByCPF(cpf: string): Promise<User | null>;
  exists(userId: string): Promise<boolean>;
}