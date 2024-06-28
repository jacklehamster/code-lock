import { Lock } from '@/interface/Lock';
import { createClient, RedisClientType, RedisClientOptions } from 'redis';


export class RedisLock implements Lock {
  locks: Record<string, number> = {};
  redis;

  constructor({
    redis,
    redisOptions,
  }: {
    redis?: RedisClientType;
    redisOptions?: RedisClientOptions;
  }) {
    if (!redis && !redisOptions) {
      throw new Error("Missing options");
    }
    this.redis = redis ?? createClient(redisOptions);
  }

  async acquire(key: string, ttl: number = 5000): Promise<void> {
    const value = `${Date.now()}`;
    const acquired = await this.setLock(key, value, ttl);
    if (acquired) {
      this.locks[key] = parseInt(value, 10);
    } else {
      throw new Error(`Could not acquire lock for key: ${key}`);
    }
  }

  async release(key: string): Promise<void> {
    if (this.hasLock(key)) {
      await this.delLock(key);
      delete this.locks[key];
    } else {
      throw new Error(`No lock found for key: ${key}`);
    }
  }

  hasLock(key: string): boolean {
    return !!this.locks[key];
  }

  async executeWithLock<T = void>(callback: () => Promise<T>, key: string, ttl?: number): Promise<T> {
    await this.acquire(key, ttl);
    try {
      return await callback();
    } finally {
      await this.release(key);
    }
  }

  private async setLock(key: string, value: string, ttl: number): Promise<boolean> {
    const result = await this.redis.set(key, value, {
      NX: true,
      PX: ttl,
    });
    return result === 'OK';
  }

  private async delLock(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
