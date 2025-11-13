import { createClient, RedisClientType } from 'redis';
import { logger } from '../../utils/logger';

let redisClient: RedisClientType | null = null;

export const getRedisClient = async (): Promise<RedisClientType> => {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  redisClient = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries: number) => {
        if (retries > 10) {
          logger.error('Redis: Max reconnection attempts reached');
          return new Error('Max reconnection attempts reached');
        }
        const delay = Math.min(retries * 100, 3000);
        logger.warn(`Redis: Reconnecting in ${delay}ms (attempt ${retries})`);
        return delay;
      },
    },
  });

  redisClient.on('error', (err: unknown) => {
    logger.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    logger.info('Redis: Connected successfully');
  });

  redisClient.on('reconnecting', () => {
    logger.warn('Redis: Reconnecting...');
  });

  redisClient.on('ready', () => {
    logger.info('Redis: Ready to accept commands');
  });

  await redisClient.connect();

  return redisClient;
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis: Connection closed');
  }
};

/**
 * Redis Cache Helper Class
 */
export class RedisCache {
  private client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error: any) {
      logger.error('Redis get error:', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set value in cache with optional TTL (in seconds)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error: any) {
      logger.error('Redis set error:', { key, error: error.message });
      throw error;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error: any) {
      logger.error('Redis delete error:', { key, error: error.message });
      throw error;
    }
  }

  /**
   * Delete multiple keys
   */
  async deleteMany(keys: string[]): Promise<void> {
    try {
      if (keys.length === 0) return;
      await this.client.del(keys);
    } catch (error: any) {
      logger.error('Redis deleteMany error:', { keys, error: error.message });
      throw error;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error: any) {
      logger.error('Redis exists error:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Set expiration time for a key (in seconds)
   */
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error: any) {
      logger.error('Redis expire error:', { key, error: error.message });
      throw error;
    }
  }

  /**
   * Get TTL (time to live) for a key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error: any) {
      logger.error('Redis ttl error:', { key, error: error.message });
      return -1;
    }
  }

  /**
   * Increment a counter
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.client.incrBy(key, amount);
    } catch (error: any) {
      logger.error('Redis increment error:', { key, error: error.message });
      throw error;
    }
  }

  /**
   * Decrement a counter
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.client.decrBy(key, amount);
    } catch (error: any) {
      logger.error('Redis decrement error:', { key, error: error.message });
      throw error;
    }
  }

  /**
   * Get all keys matching a pattern
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error: any) {
      logger.error('Redis keys error:', { pattern, error: error.message });
      return [];
    }
  }

  /**
   * Flush all keys in current database
   */
  async flushDb(): Promise<void> {
    try {
      await this.client.flushDb();
      logger.info('Redis: Database flushed');
    } catch (error: any) {
      logger.error('Redis flushDb error:', error);
      throw error;
    }
  }

  /**
   * Set value only if key doesn't exist (NX - Set if Not eXists)
   */
  async setNX(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      const result = ttl
        ? await this.client.set(key, serialized, { NX: true, EX: ttl })
        : await this.client.set(key, serialized, { NX: true });
      return result === 'OK';
    } catch (error: any) {
      logger.error('Redis setNX error:', { key, error: error.message });
      return false;
    }
  }

  /**
   * Add to Set
   */
  async sAdd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sAdd(key, members);
    } catch (error: any) {
      logger.error('Redis sAdd error:', { key, error: error.message });
      throw error;
    }
  }

  /**
   * Get all members of Set
   */
  async sMembers(key: string): Promise<string[]> {
    try {
      return await this.client.sMembers(key);
    } catch (error: any) {
      logger.error('Redis sMembers error:', { key, error: error.message });
      return [];
    }
  }

  /**
   * Remove from Set
   */
  async sRem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sRem(key, members);
    } catch (error: any) {
      logger.error('Redis sRem error:', { key, error: error.message });
      throw error;
    }
  }

  /**
   * Hash Set
   */
  async hSet(key: string, field: string, value: any): Promise<number> {
    try {
      const serialized = JSON.stringify(value);
      return await this.client.hSet(key, field, serialized);
    } catch (error: any) {
      logger.error('Redis hSet error:', { key, field, error: error.message });
      throw error;
    }
  }

  /**
   * Hash Get
   */
  async hGet<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.client.hGet(key, field);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error: any) {
      logger.error('Redis hGet error:', { key, field, error: error.message });
      return null;
    }
  }

  /**
   * Hash Get All
   */
  async hGetAll<T>(key: string): Promise<Record<string, T>> {
    try {
      const data = await this.client.hGetAll(key);
      const result: Record<string, T> = {};
      
      for (const [field, value] of Object.entries(data)) {
        result[field] = JSON.parse(value as string) as T;
      }
      return result;
    } catch (error: any) {
      logger.error('Redis hGetAll error:', { key, error: error.message });
      return {};
    }
  }

  /**
   * Hash Delete
   */
  async hDel(key: string, ...fields: string[]): Promise<number> {
    try {
      return await this.client.hDel(key, fields);
    } catch (error: any) {
      logger.error('Redis hDel error:', { key, fields, error: error.message });
      throw error;
    }
  }
}

/**
 * Create a new RedisCache instance
 */
export const createRedisCache = async (): Promise<RedisCache> => {
  const client = await getRedisClient();
  return new RedisCache(client);
};