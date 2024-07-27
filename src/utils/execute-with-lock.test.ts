import { executeWithLock } from "./execute-with-lock";
import { Lock } from "../interface/Lock";

describe("executeWithLock", () => {
  let lock: jest.Mocked<Lock>;
  let callback: jest.Mock<Promise<void>, []>;

  beforeEach(() => {
    lock = {
      acquire: jest.fn(),
      release: jest.fn(),
      hasLock: jest.fn(),
    } as jest.Mocked<Lock>;

    callback = jest.fn().mockResolvedValue(undefined);
  });

  it("should acquire and release the lock", async () => {
    const key = "test-key";
    const ttl = 1000;

    await executeWithLock(lock, callback, key, ttl);

    expect(lock.acquire).toHaveBeenCalledWith(key, ttl);
    expect(callback).toHaveBeenCalled();
    expect(lock.release).toHaveBeenCalledWith(key);
  });

  it("should release the lock even if the callback throws an error", async () => {
    const key = "test-key";
    const ttl = 1000;
    const error = new Error("callback error");

    callback.mockRejectedValueOnce(error);

    await expect(executeWithLock(lock, callback, key, ttl)).rejects.toThrow(error);

    expect(lock.acquire).toHaveBeenCalledWith(key, ttl);
    expect(callback).toHaveBeenCalled();
    expect(lock.release).toHaveBeenCalledWith(key);
  });
});
