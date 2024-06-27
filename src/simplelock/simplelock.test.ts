import { SimpleLock } from './SimpleLock';  // Adjust the import path as necessary

describe('SimpleLock', () => {
  let lock: SimpleLock;

  beforeEach(() => {
    lock = new SimpleLock();
  });

  afterEach(() => {
    // Ensure all keys are released after each test
    lock.lockedKeys.clear();
  });

  it('should acquire and release a lock', async () => {
    const key = 'testKey';

    // Acquire lock
    await lock.acquire(key);
    expect(lock.lockedKeys.has(key)).toBe(true);

    // Release lock
    lock.release(key);
    expect(lock.lockedKeys.has(key)).toBe(false);
  });

  it('should not acquire a lock if already locked', async () => {
    const key = 'testKey';
    
    // Acquire lock
    await lock.acquire(key);
    expect(lock.lockedKeys.has(key)).toBe(true);

    // Attempt to acquire the same lock
    let lockAcquired = false;
    lock.acquire(key).then(() => {
      lockAcquired = true;
    });

    // Give some time for the lock to be potentially acquired
    await new Promise((resolve) => setTimeout(resolve, 50));
    
    // Expect that the lock has not been re-acquired
    expect(lockAcquired).toBe(false);

    // Release lock and check if it can be acquired again
    lock.release(key);
    await lock.acquire(key);
    expect(lock.lockedKeys.has(key)).toBe(true);
  });

  it('should timeout if lock is not acquired', async () => {
    const key = 'testKey';
    const shortTimeout = 100;  // 100 ms timeout

    const shortLock = new SimpleLock();

    // Acquire lock
    await shortLock.acquire(key, shortTimeout);
    expect(shortLock.lockedKeys.has(key)).toBe(true);

    // Attempt to acquire the same lock and expect it to timeout
    const start = Date.now();
    await shortLock.acquire(key, shortTimeout);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(shortTimeout);
  });
});
