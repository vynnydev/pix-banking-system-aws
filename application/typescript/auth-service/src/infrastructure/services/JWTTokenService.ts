import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from '@pix-banking/shared';
import { ITokenService, JWTPayload, TokenPair } from '../../domain/services/ITokenService';

export class JWTTokenService implements ITokenService {
  generateTokens(payload: JWTPayload): TokenPair {  // ← RENOMEAR
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }

  verifyAccessToken(token: string): JWTPayload {
    return verifyAccessToken(token);
  }

  verifyRefreshToken(token: string): JWTPayload {
    return verifyRefreshToken(token);
  }
}