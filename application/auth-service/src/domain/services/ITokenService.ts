export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }
  
  export interface ITokenService {
    generateTokenPair(userId: string, email: string): TokenPair;
    verifyAccessToken(token: string): { userId: string; email: string };
    verifyRefreshToken(token: string): { userId: string; email: string };
  }