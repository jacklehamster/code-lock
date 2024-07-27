import { Lock } from "./interface/Lock";
import { DataClientLock } from "./redislock/dataclient-lock";
import { SimpleLock } from "./simplelock/simplelock";

export { Lock, DataClientLock as RedisLock, SimpleLock };
export { executeWithLock } from "./utils/execute-with-lock";
