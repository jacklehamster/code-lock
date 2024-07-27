import { Lock } from "@/interface/Lock";

export async function executeWithLock<T = void>(lock: Lock, callback: () => Promise<T>, key: string, ttl?: number) {
  await lock.acquire(key, ttl);
  try {
    return await callback();
  } finally {
    await lock.release(key);
  }
}
