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
 * Drop function calls until it doesn't get called for a specific period.
 * @param f - The target function to debounce (it must not throw errors)
 * @param ms - The time period in milliseconds
 */
export const debounce = <const Args extends any[]>(
  f: (...args: Args) => any,
  ms: number,
): ((...args: Args) => void) => {
  // Expire time for debounce
  let id: any;

  return (...a) => {
    clearTimeout(id);
    id = setTimeout(f, ms, ...a);
  };
};

/**
 * Drop function calls for a specific period
 * @param f - The target function to rate limit (it must not throw errors)
 * @param ms - The time period in milliseconds
 * @param limit - The call limit in the time period
 */
export const rateLimit = <const Args extends any[]>(
  f: (...args: Args) => any,
  ms: number,
  limit: number
): ((...args: Args) => void) => {
  const call = () => { limit++; }

  return (...a) => {
    if (limit > 0) {
      limit--;
      f(...a);
      setTimeout(call, ms);
    }
  };
};

type QueueNode<T> = [
  next: QueueNode<T> | null,
  resolve: (v: any) => void,
  value: T
];

/**
 * Throttle function execution for a time period
 * @param f - The function to throttle (it must not throw errors)
 * @param ms - The time in milliseconds
 * @param limit - The call limit in the time period
 */
export const throttle = <const Args extends any[], const R>(
  f: (...args: Args) => R,
  ms: number,
  limit: number
): ((...args: Args) => Promise<Awaited<R>>) => {
  let head: QueueNode<Args> = [null] as any;
  let tail = head;

  const unlock = () => {
    if (tail !== head) {
      tail = tail[0]!;
      // Resolve tail promise
      tail[1](f(...tail[2]));
      // Unlock another item
      setTimeout(unlock, ms);
    } else limit++;
  }

  // @ts-ignore
  return (...a) => {
    if (limit === 0) {
      let r: (v: R) => void;
      const p = new Promise((res) => { r = res });
      head = head[0] = [null!, r!, a];
      return p;
    }

    limit--;
    setTimeout(unlock, ms);
    return f(...a);
  };
}
