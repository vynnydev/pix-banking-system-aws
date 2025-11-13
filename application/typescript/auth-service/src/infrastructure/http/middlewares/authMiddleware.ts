import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, UnauthorizedError, createRedisCache } from '@pix-banking/shared';
import { LogoutUseCase } from '../../../application/use-cases/auth/LogoutUseCase';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
  token?: string;
}

let redisCache: any = null;

// Initialize Redis cache (singleton)
const getRedisCache = async () => {
  if (!redisCache && process.env.REDIS_URL) {
    try {
      redisCache = await createRedisCache();
    } catch (error) {
      console.warn('Redis not available, token blacklist disabled');
    }
  }
  return redisCache;
};

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Authorization header missing');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid authorization format');
    }

    const token = parts[1];
    
    // Verify JWT signature and expiration
    const payload = verifyAccessToken(token);

    // Check if token is blacklisted (if Redis is available)
    const cache = await getRedisCache();
    if (cache) {
      const isBlacklisted = await LogoutUseCase.isTokenBlacklisted(token, cache);
      if (isBlacklisted) {
        throw new UnauthorizedError('Token has been revoked');
      }
    }

    // Attach user info and token to request
    req.user = payload;
    req.token = token;
    
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};