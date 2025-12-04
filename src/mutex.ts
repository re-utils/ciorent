import { nextTick } from './index.js';
import {
  chainLock,
  type Extend,
  loadResolve,
  promiseResolver,
} from './utils.js';

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

  const release = promiseResolver[0];
  await currentLock;
  return release;
};

/**
 * Automatically acquire and run a task.
 */
export const run = <const T extends (...args: any[]) => Promise<any>>(mu: Extend<Mutex>, fn: T, ...args: Parameters<T>): ReturnType<T> =>
  mu[0] = chainLock(mu[0], fn, ...args) as any;
