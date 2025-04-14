/**
 * @module Other utilities
 */

import type { QueueNode } from './fixed-queue.js';

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
 * Spawn n sequential task
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
 * Throttle function execution for a time period
 * @param f - The function to throttle (it must not throw errors)
 * @param ms - The time in milliseconds
 * @param limit - The call limit in the time period
 */
export const throttle = (ms: number, limit: number): (() => Promise<void>) => {
  // Promise resolve queue
  let head: QueueNode<() => void> = [null] as any;
  let tail = head;

  let cur = limit;

  // Current timeout
  let scheduled = false;

  const unlock = () => {
    cur = limit;

    // Resolve items in the queue
    while (cur > 0) {
      // Queue has no item
      if (tail === head) {
        scheduled = false;
        return;
      }

      cur--;
      // Resolve tail promise
      (tail = tail[0]!)[1]();
    }

    setTimeout(unlock, ms);
  };

  return () => {
    if (cur === 0) {
      // Queue the task when necessary
      let r: () => void;
      const p = new Promise<void>((res) => {
        r = res;
      });
      head = head[0] = [null!, r!];
      return p;
    }

    if (!scheduled) {
      scheduled = true;
      setTimeout(unlock, ms);
    }

    cur--;
    return pause;
  };
};
