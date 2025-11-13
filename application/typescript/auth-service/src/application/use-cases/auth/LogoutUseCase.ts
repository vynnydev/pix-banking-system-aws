import { logger, UnauthorizedError } from '@pix-banking/shared';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { RedisCache } from '@pix-banking/shared';

export class LogoutUseCase {
  constructor(
    private userRepository: IUserRepository,
    private redisCache?: RedisCache
  ) {}

  async execute(userId: string, accessToken: string): Promise<void> {
    try {
      // Verify user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      // If Redis is available, blacklist the token
      if (this.redisCache) {
        await this.blacklistToken(accessToken);
        
        // Also invalidate any cached user sessions
        await this.invalidateUserSessions(userId);
      }

      logger.info('User logged out successfully', {
        userId,
        email: user.email,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      logger.error('Logout error', {
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Add token to blacklist with expiration matching token TTL
   */
  private async blacklistToken(token: string): Promise<void> {
    if (!this.redisCache) return;

    try {
      const tokenKey = `blacklist:token:${token}`;
      
      // Store in blacklist for the remaining token lifetime (1 hour default)
      const ttl = 3600; // Should match JWT_EXPIRES_IN
      
      await this.redisCache.set(tokenKey, {
        blacklistedAt: new Date().toISOString(),
        reason: 'USER_LOGOUT',
      }, ttl);

      logger.debug('Token blacklisted', { tokenKey });
    } catch (error: any) {
      logger.error('Failed to blacklist token', { error: error.message });
      // Don't throw - logout should succeed even if Redis fails
    }
  }

  /**
   * Invalidate all cached user sessions
   */
  private async invalidateUserSessions(userId: string): Promise<void> {
    if (!this.redisCache) return;

    try {
      // Remove user session cache
      await this.redisCache.delete(`session:${userId}`);
      
      // Remove user balance cache
      await this.redisCache.delete(`balance:${userId}`);
      
      // Remove user account cache
      await this.redisCache.delete(`account:${userId}`);

      // Find and delete all user-specific cache keys
      const userCachePattern = `user:${userId}:*`;
      const userKeys = await this.redisCache.keys(userCachePattern);
      
      if (userKeys.length > 0) {
        await this.redisCache.deleteMany(userKeys);
      }

      logger.debug('User sessions invalidated', {
        userId,
        keysDeleted: userKeys.length + 3,
      });
    } catch (error: any) {
      logger.error('Failed to invalidate user sessions', {
        userId,
        error: error.message,
      });
      // Don't throw - logout should succeed even if cache cleanup fails
    }
  }

  /**
   * Check if a token is blacklisted (to be used in auth middleware)
   */
  static async isTokenBlacklisted(
    token: string,
    redisCache?: RedisCache
  ): Promise<boolean> {
    if (!redisCache) return false;

    try {
      const tokenKey = `blacklist:token:${token}`;
      const isBlacklisted = await redisCache.exists(tokenKey);
      
      if (isBlacklisted) {
        logger.warn('Attempted to use blacklisted token', { tokenKey });
      }
      
      return isBlacklisted;
    } catch (error: any) {
      logger.error('Error checking token blacklist', { error: error.message });
      // If Redis is down, allow the request (fail open)
      return false;
    }
  }

  /**
   * Logout from all devices (invalidate all refresh tokens)
   */
  async logoutFromAllDevices(userId: string): Promise<void> {
    if (!this.redisCache) {
      logger.warn('Cannot logout from all devices: Redis not available');
      return;
    }

    try {
      // Find all refresh tokens for this user
      const refreshTokenPattern = `refresh:${userId}:*`;
      const refreshTokenKeys = await this.redisCache.keys(refreshTokenPattern);

      // Blacklist all refresh tokens
      if (refreshTokenKeys.length > 0) {
        for (const key of refreshTokenKeys) {
          const token = await this.redisCache.get<string>(key);
          if (token) {
            await this.blacklistToken(token);
          }
        }
        
        // Delete all refresh token entries
        await this.redisCache.deleteMany(refreshTokenKeys);
      }

      // Invalidate all sessions
      await this.invalidateUserSessions(userId);

      logger.info('User logged out from all devices', {
        userId,
        tokensInvalidated: refreshTokenKeys.length,
      });
    } catch (error: any) {
      logger.error('Error logging out from all devices', {
        userId,
        error: error.message,
      });
      throw error;
    }
  }
}