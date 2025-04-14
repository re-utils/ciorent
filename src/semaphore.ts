/**
 * @module Semaphores
 */

import { nextTick as resolvedPromise } from './index.js';
import type { Node as QueueNode } from './queue.js';
import {
  acquire as lockAcquire,
  release as lockRelease,
  type Lock,
} from './lock.js';

/**
 * Describe a semaphore
 */
export interface Semaphore extends Lock<undefined> {
  /**
   * Current remaining process allowed
   */
  2: number;
}

/**
 * Create a semaphore that allows n accesses
 */
export const init = (n: number): Semaphore => {
  const root = [null] as any as QueueNode<() => void>;
  return [root, root, n];
};

/**
 * Wait until the semaphore allows access
 */
export const acquire = (s: Semaphore): Promise<void> => {
  s[2]--;
  return s[2] >= 0 ? resolvedPromise : lockAcquire(s);
};

/**
 * Signal to the semaphore to release access
 */
export const release = (s: Semaphore): void => {
  // Unlock for 1 task
  if (s[2] < 0) lockRelease(s);
  s[2]++;
};

/**
 * Bind a task to a semaphore
 */
export const bind =
  <T extends (...args: any[]) => Promise<any>>(f: T, s: Semaphore): T =>
  // @ts-expect-error It is valid
  async (...a) => {
    // Fast path
    s[2]--;
    if (s[2] < 0) await acquire(s);

    try {
      return await f(...a);
    } finally {
      // Unlock for 1 task
      if (s[2] < 0) release(s);
      s[2]++;
    }
  };
