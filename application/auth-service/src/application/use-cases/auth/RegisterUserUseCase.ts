import { User, Account, PixKey, hashPassword, ValidationError, CPF, Email } from '@pix-banking/shared';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IAccountRepository } from '../../../domain/repositories/IAccountRepository';
import { IPixKeyRepository } from '../../../domain/repositories/IPixKeyRepository';
import { ITokenService, TokenPair } from '../../../domain/services/ITokenService';
import { RegisterUserDTO } from '../../dtos/RegisterUserDTO';

export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private accountRepository: IAccountRepository,
    private pixKeyRepository: IPixKeyRepository,
    private tokenService: ITokenService
  ) {}

  async execute(dto: RegisterUserDTO): Promise<{
    user: any;
    account: any;
    tokens: TokenPair;
  }> {
    // Validate CPF and Email using Value Objects
    const cpf = new CPF(dto.cpf);
    const email = new Email(dto.email);

    // Check if user already exists
    const userExists = await this.userRepository.exists(email.getValue(), cpf.getValue());
    if (userExists) {
      throw new ValidationError('User with this email or CPF already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(dto.password);

    // Create User entity
    const user = User.create({
      email: email.getValue(),
      passwordHash,
      fullName: dto.fullName,
      cpf: cpf.getValue(),
      phone: dto.phone,
    });

    // Generate account number (simple logic - in production use a proper generator)
    const accountNumber = this.generateAccountNumber();

    // Create Account entity
    const account = Account.create(user.userId, accountNumber);

    // Create default PIX key (CPF)
    const pixKey = PixKey.create(account.accountId, cpf.getValue(), 'CPF');

    // Save all entities
    await this.userRepository.save(user);
    await this.accountRepository.save(account);
    await this.pixKeyRepository.save(pixKey);

    // Generate JWT tokens
    const tokens = this.tokenService.generateTokenPair(user.userId, user.email);

    return {
      user: user.toJSON(),
      account: account.toJSON(),
      tokens,
    };
  }

  private generateAccountNumber(): string {
    const random = Math.floor(Math.random() * 90000) + 10000;
    const digit = random % 10;
    return `${random}-${digit}`;
  }
}