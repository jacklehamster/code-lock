import { Lock } from '@/interface/Lock';
import Redis, { RedisOptions } from 'ioredis';
import Redlock, { CompatibleRedisClient } from 'redlock';

export class RedisLock implements Lock {
  private redlock: Redlock;
  locks: Record<string, Redlock.Lock> = {};

  constructor({
    redlock,
    redis,
    redisOptions,
  }: {
    redlock?: Redlock;
    redis?: Redis;
    redisOptions?: RedisOptions;
  }) {
    this.redlock = redlock ?? new Redlock([redis as unknown as CompatibleRedisClient], {
      driftFactor: 0.01,
      retryCount: 10,
      retryDelay: 200,
      retryJitter: 200,
    }) ?? new Redlock([
      new Redis(redisOptions!) as unknown as CompatibleRedisClient,
    ]);
  }

  async acquire(key: string, ttl: number = 5000): Promise<void> {
    const lock = await this.redlock.acquire([key], ttl);
    this.locks[key] = lock;
  }

  async release(key: string): Promise<void> {
    const lock = this.locks[key];
    if (lock) {
      await lock.unlock();
      delete this.locks[key];
    }
  }

  hasLock(key: string): boolean {
    return !!this.locks[key];
  }

  async executeWithLock(callback: () => Promise<void>, key: string, ttl?: number): Promise<void> {
    await this.acquire(key, ttl);
    await callback();
    await this.release(key);
  }
}
