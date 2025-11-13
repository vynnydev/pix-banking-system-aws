import { UnauthorizedError } from '@pix-banking/shared';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ITokenService, TokenPair } from '../../../domain/services/ITokenService';

export class RefreshTokenUseCase {
  constructor(
    private userRepository: IUserRepository,
    private tokenService: ITokenService
  ) {}

  async execute(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const payload = this.tokenService.verifyRefreshToken(refreshToken);
      return await (async () => {
        // Verify user still exists
        const user = await this.userRepository.findById(payload.userId);
        if (!user) {
          throw new UnauthorizedError('User not found');
        }

        // Generate new token pair
        return this.tokenService.generateTokens({
          userId: user.userId,
          email: user.email,
        });
      })();
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }
}