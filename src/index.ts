/**
 * @module Other utilities
 */

/**
 * Continue the execution on next event loop cycle.
 *
 * You can `await` this **occasionally** in an expensive synchronous operation to avoid
 *
 * blocking the main thread and let other asynchronous task to run.
 */
export const nextTick: Promise<void> = Promise.resolve();

/**
 * Get the state of a promise on next tick:
 * - `0`: Input promise rejected
 * - `1`: Input promise resolves
 * - `2`: Input promise pending
 */
export const state = async (p: Promise<any>): Promise<0 | 1 | 2> => {
  let res: 0 | 1 | 2 = 2;
  p.then(
    () => {
      res = 1;
    },
    (e) => {
      res = 0;
      return Promise.reject(e);
    }
  );
  await nextTick;
  return res;
}

/**
 * Sleep for a duration.
 * @param ms - Sleep duration in milliseconds
 */
export const sleep: (ms: number) => Promise<void> =
  globalThis.Bun?.sleep ??
  globalThis.process?.getBuiltinModule?.('timers/promises').setTimeout ??
  ((ms) =>
    new Promise((res: any) => {
      setTimeout(res, ms);
    }));

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

export * as signal from './signal.js';
export * as rateLimit from './rate-limit.js';
export * as semaphore from './semaphore.js';
