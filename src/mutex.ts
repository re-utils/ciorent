import { nextTick } from './index.js';

/**
 * Describe a mutex
 */
export type Mutex = () => Promise<() => void>;

/**
 * Create a mutex.
 */
export const init = (): Mutex => {
  let lock = nextTick;
  let resolve;
  const callback = (res: () => void) => {
    resolve = res;
  };

  return async () => {
    const currentLock = lock!;
    lock = new Promise<void>(callback);

    const release = resolve!;
    await currentLock;
    return release;
  };
};

const chainLock = async (lock: any, fn: any, ...args: any[]) => {
  try {
    await lock!;
  } catch {}
  return fn(...args);
};

/**
 * Equivalent to `semaphore.permits(fn, 1)` but way faster.
 */
export const permits = <const T extends (...args: any[]) => Promise<any>>(
  fn: T,
): T => {
  let lock = nextTick;
  return ((...args) => (lock = chainLock(lock!, fn, ...args))) as T;
};
