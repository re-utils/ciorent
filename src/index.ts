import { loadedReject, loadedResolve, loadResolve, loadResolvers } from './utils.js';

/**
 * Continue the execution on next event loop cycle.
 *
 * You can `await` this **occasionally** in an expensive synchronous operation to avoid
 * blocking the main thread and let other asynchronous task to run.
 */
export const nextTick: Promise<void> = Promise.resolve();

const getFinishedState = async (s: [number], p: Promise<any>) => {
  try {
    await p;
    s[0] = 1;
  } catch (e) {
    s[0] = 0;

    // Don't swallow error
    return p;
  }
};
/**
 * Get the state of a promise on next tick:
 * - `0`: Input promise rejected
 * - `1`: Input promise resolves
 * - `2`: Input promise pending
 */
export const state = async (p: Promise<any>): Promise<0 | 1 | 2> => {
  const res = [2] as [0 | 1 | 2];
  getFinishedState(res, p);
  await nextTick;
  return res[0] as any;
};

/**
 * Check whether a value is awaitable
 * @param p
 * @returns
 */
export const isThenable = <T>(p: unknown): p is PromiseLike<T> =>
  p !== null &&
  typeof p === 'object' &&
  !Array.isArray(p) &&
  // @ts-ignore
  typeof p.then === 'function';

const resolvePromise = async (p: any) => {
  try {
    loadedResolve(await p);
  } catch (e) {
    loadedReject(e);
  }
};
/**
 * Timeout a promise
 * @param p
 * @param ms
 */
export const timeout = <T>(p: Promise<T>, ms: number): Promise<T | void> => {
  const promise = new Promise<void>(loadResolvers);
  setTimeout(loadedResolve, ms);
  resolvePromise(p);
  return promise;
};

/**
 * Sleep for a duration.
 * @param ms - Sleep duration in milliseconds
 */
export const sleep: (ms: number) => Promise<void> =
  globalThis.Bun?.sleep ??
  globalThis.process?.getBuiltinModule?.('timers/promises').setTimeout ??
  ((ms) => {
    const promise = new Promise(loadResolve);
    setTimeout(loadedResolve, ms);
    return promise;
  });

const sharedBuf = new Int32Array(new SharedArrayBuffer(4));

/**
 * Sleep for a duration synchronously.
 *
 * This method blocks the current thread.
 *
 * On the browser it only works in workers.
 * @param ms - Sleep duration in milliseconds
 */
export const sleepSync: (ms: number) => void =
  globalThis.Bun?.sleepSync ??
  ((ms) => {
    Atomics.wait(sharedBuf, 0, 0, ms);
  });

export * as mutex from './mutex.js';
export * as limit from './rate-limit.js';
export * as semaphore from './semaphore.js';
export * as signal from './signal.js';
