import { Lock } from "@/interface/Lock";

export class SimpleLock implements Lock {
  lockedKeys = new Set<string>();

  /**
   * Acquires a lock on the specified key. If the key is already locked,
   * it retries until the lock is acquired or the timeout is reached.
   * @param key - The key to lock.
   * @returns A promise that resolves when the lock is acquired.
   */
  async acquire(key: string, ttl: number = 5000): Promise<void> {
    const startTime = Date.now();
    return new Promise((resolve) => {
      const tryLock = () => {
        // Check if the key is not locked or the timeout has been reached
        if (!this.hasLock(key) || Date.now() - startTime >= ttl) {
          this.lockedKeys.add(key);
          resolve();
        } else {
          setTimeout(tryLock, 10);  // Retry every 10 milliseconds
        }
      };
      tryLock();
    });
  }

  /**
   * Releases the lock on the specified key.
   * @param key - The key to unlock.
   */
  async release(key: string) {
    this.lockedKeys.delete(key);
  }

  hasLock(key: string): boolean {
    return this.lockedKeys.has(key);
  }

  async executeWithLock<T>(callback: () => Promise<T>, key: string, ttl?: number): Promise<T> {
    await this.acquire(key, ttl);
    const result = await callback();
    await this.release(key);
    return result;
  }

  // Static instance of SimpleLock for convenience
  static lock = new SimpleLock();
}
