import { DbApi } from "@dobuki/data-client";
import { executeWithLock } from "./execute-with-lock";
import { Lock } from "@/interface/Lock";

interface Props {
  lockGet: boolean;
  lockSet: boolean;
}

export function lockWrap(db: DbApi, lock: Lock, props: Props = {
  lockGet: false,
  lockSet: true,
}) {
  return {
    listKeys: async (keyprefix?: string, branch?: string, recursive?: boolean) => {
      return db.listKeys(keyprefix, branch, recursive);
    },
    getData: async (key: string) => {
      if (props.lockGet) {
        return executeWithLock(lock, async () => {
          return db.getData(key);
        }, key);
      }
      return db.getData(key);
    },
    setData: async (key: string, valueOrCall: any, options?: any) => {
      if (props.lockSet) {
        return executeWithLock(lock, async () => {
          return db.setData(key, valueOrCall, options);
        }, key);
      }
      return db.setData(key, valueOrCall, options);
    },
  };
}
