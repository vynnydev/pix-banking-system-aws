export interface JWTPayload {
  userId: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenService {
  generateTokens(payload: JWTPayload): TokenPair;  // ← RENOMEAR de generateTokenPair para generateTokens
  verifyAccessToken(token: string): JWTPayload;
  verifyRefreshToken(token: string): JWTPayload;
}