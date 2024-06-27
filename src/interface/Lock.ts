export interface Lock {
  acquire(key: string, ttl?: number): Promise<void>;
  release(key: string): Promise<void>;
  hasLock(key: string): boolean;
  executeWithLock(callback: () => Promise<void>, key: string, ttl?: number): Promise<void>;
}
