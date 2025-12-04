export type Extend<T extends any[]> = [...T, ...any[]];

export const promiseResolver: [
  resolve: (res?: any) => void,
  reject: (reason?: any) => void,
] = [null!, null!];

export const loadResolvers = (
  res: (value?: any) => void,
  rej: (reason?: any) => void,
): void => {
  promiseResolver[0] = res;
  promiseResolver[1] = rej;
};

export const loadResolve = (res: (value?: any) => void): void => {
  promiseResolver[0] = res;
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
