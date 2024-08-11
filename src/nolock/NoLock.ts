import { Lock } from "..";

export class NoLock implements Lock {
  hasLock(): boolean {
    return false;
  }

  async acquire() {
    return;
  }

  async release() {
    return;
  }
}
