import { RedisLock } from './redislock';
import Redis from 'ioredis';
import Redlock from 'redlock';
import IORedisMock from 'ioredis-mock';

describe('RedisLock', () => {
  let redis: Redis;
  let redisLock: RedisLock;
  let redlock: Redlock;

  beforeEach(() => {
    redis = new IORedisMock() as unknown as Redis;
    redlock = new Redlock([redis as unknown as Redlock.CompatibleRedisClient]);
    redisLock = new RedisLock({ redlock });
  });

  it('should acquire a lock', async () => {
    const key = 'resource-key';
    const ttl = 5000;

    await redisLock.acquire(key, ttl);

    const lockExists = redisLock.hasLock(key);
    expect(lockExists).toBeTruthy();
  });

  it('should release a lock', async () => {
    const key = 'resource-key-2';
    const ttl = 5000;

    await redisLock.acquire(key, ttl);
    const lockExistsBeforeRelease = redisLock.hasLock(key);
    expect(lockExistsBeforeRelease).toBeTruthy();

    await redisLock.release(key);

    const lockExistsAfterRelease = redisLock.hasLock(key);
    expect(lockExistsAfterRelease).toBeFalsy();
  });

  it('should handle releasing a non-existent lock', async () => {
    const key = 'non-existent-key';

    await redisLock.release(key);

    // No assertions needed, just ensure no error is thrown
  });

  it('should throw an error if unable to acquire a lock', async () => {
    const key = 'resource-key-3';
    const ttl = 5000;

    jest.spyOn(redlock, 'acquire').mockImplementation(() => {
      throw new Error('Unable to acquire lock');
    });

    await expect(redisLock.acquire(key, ttl)).rejects.toThrow('Unable to acquire lock');
  });
});
