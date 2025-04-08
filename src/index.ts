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
export const sleep: (ms: number) => Promise<void> =
  globalThis.Bun?.sleep ??
  globalThis.process?.getBuiltinModule?.('timers/promises').setTimeout ??
  ((ms) =>
    new Promise((res) => {
      setTimeout(res, ms);
    }));

const sharedBuf = new Int32Array(new SharedArrayBuffer(4));
/**
 * Sleep for a duration synchronously.
 *
 * On the browser it only works in workers.
 * @param ms - Sleep duration in milliseconds
 */
export const sleepSync: (ms: number) => void =
  globalThis.Bun?.sleepSync ??
  ((ms) => {
    Atomics.wait(sharedBuf, 0, 0, ms);
  });

/**
 * Spawn n tasks that runs sequentially
 * @param n
 * @param task - The function to run
 */
export const sequential = async <const T extends any[]>(
  n: number,
  task: (...args: [...T, id: number]) => Promise<any>,
  ...args: T
): Promise<void> => {
  for (let i = 0; i < n; i++) await task(...args, i);
};

/**
 * Spawn n tasks that runs concurrently
 * @param n
 * @param task - The function to run
 */
export const concurrent = <const T extends any[], const R>(
  n: number,
  task: (...args: [...T, id: number]) => Promise<R>,
  ...args: T
): Promise<R[]> => {
  const arr = new Array(n);
  for (let i = 0; i < n; i++) arr[i] = task(...args, i);
  return Promise.all(arr);
};

/**
 * Drop sync function calls for a specific period
 * @param f - The target function to debounce
 * @param ms - The time period in milliseconds
 */
export const debounce = <const Args extends any[]>(
  f: (...args: Args) => any,
  ms: number,
): ((...args: Args) => void) => {
  // Expire time for debounce
  let args: Args;
  let unlocked = true;

  const unlock = () => {
    unlocked = true;
  };
  const call = () => Promise.try(f, ...args).finally(unlock);

  return (...a) => {
    args = a;
    if (unlocked) {
      unlocked = false;
      setTimeout(call, ms);
    }
  };
};
