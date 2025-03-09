/**
 * @module Other utilities
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

/**
 * Spawn n tasks that runs sequentially
 * @param n
 * @param task - The function to run
 */
export const sequential = async (n: number, task: (id: number) => Promise<any>): Promise<void> => {
  for (let i = 0; i < n; i++) await task(i);
};

/**
 * Spawn n tasks that runs concurrently
 * @param n
 * @param task - The function to run
 */
export const concurrent = (
  n: number,
  task: (id: number) => Promise<any>
): Promise<any> => {
  const arr = new Array(n);
  for (let i = 0; i < n; i++) arr[i] = task(i);
  return Promise.all(arr);
};
