/**
 * @module
 * Other utilities
 */

/**
 * Continue running the function on next microtask.
 *
 * You can `await` this **occasionally** in an expensive synchronous operation to avoid
 *
 * blocking the main thread and let other asynchronous task to run.
 */
export const pause: Promise<void> = Promise.resolve();

/**
 * Sleep for a duration
 * @param ms - Sleep duration in milliseconds
 */
// eslint-disable-next-line
export const sleep: (ms: number) => Promise<void> = globalThis.Bun?.sleep
  // eslint-disable-next-line
  ?? globalThis.process?.getBuiltinModule?.('timers/promises').setTimeout
  // eslint-disable-next-line
  ?? ((ms) => new Promise((res) => { setTimeout(res, ms); }));
