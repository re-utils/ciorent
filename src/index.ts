/**
 * @module Other utilities
 */

import type { Node as QueueNode } from './queue.js';

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
 * @param ms - The time in milliseconds
 * @param limit - The call limit in the time period
 */
export const throttle = (ms: number, limit: number): (() => Promise<void>) => {
  // Promise resolve queue
  let head = [null] as any as QueueNode<() => void>;
  let tail = head;

  let cur = limit;

  // Current timeout
  let scheduled = false;

  const unlock = () => {
    cur = limit;

    // Wait for another throttle to re-schedule
    if (tail === head) {
      scheduled = false;
      return;
    }

    // Resolve items in the queue
    do {
      cur--;
      // Resolve tail promise
      (tail = tail[0]!)[1]();
    } while (cur > 0 && tail !== head);

    setTimeout(unlock, ms);
  };

  return () => {
    if (cur === 0) {
      // Queue the task when necessary
      return new Promise<void>((res) => {
        head = head[0] = [null, res];
      });
    }

    if (!scheduled) {
      scheduled = true;
      setTimeout(unlock, ms);
    }

    cur--;
    return nextTick;
  };
};
