import { comparePassword, UnauthorizedError, Email } from '@pix-banking/shared';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ITokenService, TokenPair } from '../../../domain/services/ITokenService';
import { LoginDTO } from '../../dtos/LoginDTO';

export class LoginUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tokenService: ITokenService
  ) {}

  async execute(dto: LoginDTO): Promise<{
    user: any;
    tokens: TokenPair;
  }> {
    // Validate email
    const email = new Email(dto.email);

    // Find user by email
    const user = await this.userRepository.findByEmail(email.getValue());
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.tokenService.generateTokens({
      userId: user.userId,
      email: user.email,
    });

    return {
      user: user.toJSON(),
      tokens,
    };
  }
}