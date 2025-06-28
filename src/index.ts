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

/**
 * Timeout a promise after ms milliseconds
 * @param promise - Target promise to timeout
 * @param ms - Timeout duration
 */
export const timeout = <T>(
  promise: Promise<T>,
  ms: number,
): Promise<T | void> => Promise.race([promise, sleep(ms)]);

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
export * as latch from './latch.js';
export * as rateLimit from './rate-limit.js';
export * as semaphore from './semaphore.js';
