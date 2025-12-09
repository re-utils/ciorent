export type Extend<T extends any[]> = [...T, ...any[]];

export let loadedResolve: (res?: any) => void;
export let loadedReject: (reason?: any) => void;

export const loadResolvers = (
  res: (value?: any) => void,
  rej: (reason?: any) => void,
): void => {
  loadedResolve = res;
  loadedReject = rej;
};

export const loadResolve = (res: (value?: any) => void): void => {
  loadedResolve = res;
};

/**
 * Unswallow promise error.
 */
export const unswallow = async (p: Promise<any>): Promise<any> => p;

export const chainLock = async (
  lock: Promise<void>,
  fn: any,
  ...args: any[]
): Promise<any> => {
  try {
    await lock;
  } catch {
    unswallow(lock);
  }
  return fn(...args);
};
