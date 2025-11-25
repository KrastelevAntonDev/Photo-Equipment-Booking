import Redis from 'ioredis';
import { env } from './env';

/**
 * Singleton для Redis клиента
 */
class RedisClient {
  private static instance: Redis | null = null;
  private static isShuttingDown = false;

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
        db: env.REDIS_DB,
        retryStrategy: (times: number) => {
          // Exponential backoff с максимумом 10 секунд
          const delay = Math.min(times * 50, 10000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: false,
      });

      // Event handlers
      RedisClient.instance.on('connect', () => {
        console.log('✅ Redis connected');
      });

      RedisClient.instance.on('ready', () => {
        console.log('✅ Redis ready');
      });

      RedisClient.instance.on('error', (err) => {
        console.error('❌ Redis error:', err);
      });

      RedisClient.instance.on('close', () => {
        console.log('📴 Redis connection closed');
      });

      RedisClient.instance.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });
    }

    return RedisClient.instance;
  }

  /**
   * Graceful shutdown
   */
  static async close(): Promise<void> {
    if (RedisClient.isShuttingDown) {
      return;
    }

    RedisClient.isShuttingDown = true;

    if (RedisClient.instance) {
      console.log('🔌 Closing Redis connection...');
      try {
        await RedisClient.instance.quit();
        RedisClient.instance = null;
        console.log('✅ Redis connection closed gracefully');
      } catch (error) {
        console.error('❌ Error closing Redis:', error);
        // Force disconnect
        if (RedisClient.instance) {
          RedisClient.instance.disconnect();
        }
        RedisClient.instance = null;
      }
    }

    RedisClient.isShuttingDown = false;
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const client = RedisClient.getInstance();
      const result = await client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
}

export default RedisClient;
