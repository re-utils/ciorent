import {
  loadedReject,
  loadedResolve,
  loadResolve,
  loadResolvers,
} from './utils.js';

/**
 * Continue the execution on next event loop cycle.
 *
 * You can `await` this **occasionally** in an expensive synchronous operation to avoid
 * blocking the main thread and let other asynchronous task to run.
 */
export const nextTick: Promise<void> = Promise.resolve();

/**
 * Check whether a value is awaitable.
 * @param p
 * @returns
 */
export const isThenable = <T>(p: unknown): p is PromiseLike<T> =>
  p !== null &&
  typeof p === 'object' &&
  !Array.isArray(p) &&
  // @ts-ignore
  typeof p.then === 'function';

/**
 * Timeout a promise without swallowing errors.
 * @param p
 * @param ms
 */
export const timeout = <T>(p: Promise<T>, ms: number): Promise<T | void> => {
  const promise = new Promise<void>(loadResolvers);
  setTimeout(loadedResolve, ms);
  p.then(loadedResolve, loadedReject);
  return promise;
};

export * as mutex from './mutex.js';
export * as limit from './rate-limit.js';
export * as semaphore from './semaphore.js';
export * as signal from './signal.js';
export * as promises from './promises.js';
