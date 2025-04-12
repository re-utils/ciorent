/**
 * @module Other utilities
 */

/**
 * Yield back to main thread.
 *
 * You can `await` this **occasionally** in an expensive synchronous operation to avoid
 *
 * blocking the main thread and let other asynchronous task to run.
 */
export const pause: Promise<void> = Promise.resolve();

/**
 * Sleep for a duration.
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
 * Spawn n concurrent tasks
 * @param n
 * @param task - The function to run
 */
export const spawn = <const T extends any[], const R>(
  n: number,
  task: (...args: [...T, id: number]) => Promise<R>,
  ...args: T
): Promise<R>[] => {
  const arr = new Array(n);
  for (let i = 0; i < n; i++) arr[i] = task(...args, i);
  return arr;
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
  limit: number,
): ((...args: Args) => void) => {
  let cur = limit;
  const unlock = () => { cur = limit; };

  return (...a) => {
    if (cur > 0) {
      // Only setTimeout when necessary
      if (cur === 1) setTimeout(unlock, ms);

      cur--;
      f(...a);
    }
  };
};

/**
 * Throttle function execution for a time period
 * @param f - The function to throttle (it must not throw errors)
 * @param ms - The time in milliseconds
 * @param limit - The call limit in the time period
 */
export const throttle = <const Args extends any[], const R>(
  f: (...args: Args) => R,
  ms: number,
  limit: number,
): ((...args: Args) => Promise<Awaited<R>>) => {
  type QueueNode = [
    next: QueueNode | null,
    resolve: (v: any) => void,
    value: Args,
  ];

  // Promise resolve queue
  let head: QueueNode = [null] as any;
  let tail = head;

  let cur = limit;

  const unlock = () => {
    cur = limit;

    // Resolve items in the queue
    while (cur > 0) {
      // Queue has no item
      if (tail === head) return;

      cur--;
      tail = tail[0]!;
      // Resolve tail promise
      tail[1](f(...tail[2]));
    }

    setTimeout(unlock, ms);
  };

  // @ts-ignore
  return (...a) => {
    if (cur === 1) {
      // Last task of this time frame
      setTimeout(unlock, ms);
    } else if (cur === 0) {
      // Queue the task when necessary
      let r: (v: R) => void;
      const p = new Promise((res) => {
        r = res;
      });
      head = head[0] = [null!, r!, a];
      return p;
    }

    cur--;
    return f(...a);
  };
};
