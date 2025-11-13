import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IAccountRepository } from '../../../domain/repositories/IAccountRepository';
import { IPixKeyRepository } from '../../../domain/repositories/IPixKeyRepository';
import { ITokenService } from '../../../domain/services/ITokenService';
import { RegisterUserDTO } from '../../dtos/RegisterUserDTO';
import { User, Account, PixKey, Email, CPF, ValidationError } from '@pix-banking/shared';

export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private accountRepository: IAccountRepository,
    private pixKeyRepository: IPixKeyRepository,
    private tokenService: ITokenService
  ) {}

  async execute(dto: RegisterUserDTO): Promise<any> {
    // Validate email
    const email = new Email(dto.email);

    // Validate CPF
    const cpf = new CPF(dto.cpf);

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(email.getValue());
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Check if CPF already exists
    const existingCpf = await this.userRepository.findByCPF(cpf.getValue());
    if (existingCpf) {
      throw new ValidationError('CPF already registered');
    }

    // Create User entity
    const user = await User.create({
      name: dto.name,
      fullName: dto.fullName,
      email: email.getValue(),
      cpf: cpf.getValue(),
      phone: dto.phone,
      password: dto.password,
    });

    // Generate account number (simple logic - in production use a proper generator)
    const accountNumber = this.generateAccountNumber();

    // Create Account entity
    const account = Account.create(user.userId, accountNumber, '0001');

    // Create default PIX key (CPF)
    const pixKey = PixKey.create({
      accountId: account.accountId,
      keyType: 'CPF',
      keyValue: cpf.getValue(),
    });

    // Save all entities
    await this.userRepository.save(user);
    await this.accountRepository.save(account);
    await this.pixKeyRepository.save(pixKey);

    // Generate tokens
    const tokens = this.tokenService.generateTokens({
      userId: user.userId,
      email: user.email,
    });

    return {
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
      },
      account: {
        accountId: account.accountId,
        accountNumber: account.accountNumber,
        agency: account.agency,
        balance: account.balance,
      },
      tokens,
    };
  }

  private generateAccountNumber(): string {
    // Simple account number generator (in production, use sequential DB or more sophisticated logic)
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const accountNumber = `${timestamp.slice(-5)}${random}`.slice(0, 8);
    const digit = this.calculateDigit(accountNumber);
    return `${accountNumber}-${digit}`;
  }

  private calculateDigit(accountNumber: string): string {
    // Simple check digit calculation (Luhn algorithm simplified)
    const digits = accountNumber.split('').map(Number);
    const sum = digits.reduce((acc, digit, index) => {
      const weight = index % 2 === 0 ? 2 : 1;
      const product = digit * weight;
      return acc + (product > 9 ? product - 9 : product);
    }, 0);
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit.toString();
  }
}