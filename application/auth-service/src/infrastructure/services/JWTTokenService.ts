import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '@pix-banking/shared';
import { ITokenService, TokenPair } from '../../domain/services/ITokenService';

export class JWTTokenService implements ITokenService {
  generateTokenPair(userId: string, email: string): TokenPair {
    const accessToken = generateAccessToken({ userId, email });
    const refreshToken = generateRefreshToken({ userId, email });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  verifyAccessToken(token: string): { userId: string; email: string } {
    return verifyAccessToken(token);
  }

  verifyRefreshToken(token: string): { userId: string; email: string } {
    return verifyRefreshToken(token);
  }
}