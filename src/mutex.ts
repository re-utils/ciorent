import { nextTick } from './index.js';
import { type Extend, loadedResolve, loadResolve } from './utils.js';

/**
 * Describe a mutex.
 */
export type Mutex = [Promise<void>];

/**
 * Create a mutex.
 */
export const init = (): Mutex => [nextTick];

/**
 * Acquire a mutex.
 */
export const acquire = async (mu: Extend<Mutex>): Promise<() => void> => {
  const currentLock = mu[0];
  mu[0] = new Promise<void>(loadResolve);

  const release = loadedResolve;
  await currentLock;
  return release;
};

const chainLock = async (
  lock: Promise<void>,
  fn: any,
  ...args: any[]
): Promise<any> => {
  try {
    await lock;
  } finally {
    return fn(...args);
  }
};
/**
 * Automatically acquire and run a task.
 */
export const run = <const T extends (...args: any[]) => Promise<any>>(
  mu: Extend<Mutex>,
  fn: T,
  ...args: Parameters<T>
): ReturnType<T> => (mu[0] = chainLock(mu[0], fn, ...args) as any);
