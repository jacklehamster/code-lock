import { Lock } from '@/interface/Lock';
import { DataClient } from '@dobuki/data-client';


export class DataClientLock implements Lock {
  locks: Record<string, number> = {};

  constructor(private dataClient: DataClient) {
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

  private async setLock(key: string, value: string, ttl: number): Promise<boolean> {
    const result = await this.dataClient.set(key, value, {
      NX: true,
      PX: ttl,
    });
    return result === 'OK';
  }

  private async delLock(key: string): Promise<void> {
    await this.dataClient.del(key);
  }
}
