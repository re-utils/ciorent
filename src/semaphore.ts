/**
 * @module Semaphores
 */

import { pause as resolvedPromise } from './index.js';
import type { QueueNode } from './fixed-queue.js';

/**
 * Describe a semaphore
 */
export interface Semaphore {
  /**
   * Current remaining process allowed
   */
  0: number;

  /**
   * The head of the Promise resolve queue
   */
  1: QueueNode<() => void>;

  /**
   * The tail of the Promise resolve queue
   */
  2: QueueNode<() => void>;
}

/**
 * Create a semaphore that allows n accesses
 */
export const init = (n: number): Semaphore => {
  const root: QueueNode<() => void> = [null!, null];
  return [n, root, root];
};

/**
 * Wait until the semaphore allows access
 */
export const pause = (s: Semaphore): Promise<void> => {
  s[0]--;

  if (s[0] < 0) {
    // Push to the task queue
    let r;
    const p = new Promise<void>((res) => {
      r = res;
    });
    s[1] = s[1][1] = [r!, null];
    return p;
  }

  return resolvedPromise;
};

/**
 * Signal to the semaphore to release access
 */
export const signal = (s: Semaphore): void => {
  // Unlock for 1 task
  if (s[0] < 0) (s[2] = s[2][1]!)[0]();

  s[0]++;
};

/**
 * Wrap a task to bind to a custom semaphore later
 */
export const wrap =
  <Args extends any[], Return extends Promise<any>>(
    f: (...args: Args) => Return,
  ): ((s: Semaphore, ...a: Args) => Return) =>
  // @ts-expect-error It is valid
  async (s, ...a) => {
    // Fast path
    s[0]--;
    if (s[0] < 0) {
      // Push to the task queue
      let r;
      const p = new Promise<void>((res) => {
        r = res;
      });
      s[1] = s[1][1] = [r!, null];
      await p;
    }

    try {
      return await f(...a);
    } finally {
      signal(s);
    }
  };
