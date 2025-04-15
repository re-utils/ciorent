/**
 * @module Semaphores
 */

import { nextTick as resolvedPromise } from './index.js';
import type { Node as QueueNode } from './queue.js';
import {
  release as lockRelease,
  type AcquireCallback,
  type Lock,
} from './lock.js';

/**
 * Describe a semaphore
 */
export interface Semaphore extends Lock<void> {
  /**
   * Current remaining process allowed
   */
  3: number;
}

/**
 * Create a semaphore that allows n accesses
 */
export const init = (n: number): Semaphore => {
  const root = [null] as any as QueueNode<() => void>;

  const sem: Semaphore = [
    root,
    root,
    (res) => {
      sem[0] = sem[0][0] = [null, res];
    },
    n,
  ];
  return sem;
};

/**
 * Wait until the semaphore allows access
 */
export const acquire = (s: Semaphore): Promise<void> => {
  s[3]--;
  return s[3] >= 0 ? resolvedPromise : new Promise(s[2]);
};

/**
 * Signal to the semaphore to release access
 */
export const release = (s: Semaphore): void => {
  // Unlock for 1 task
  if (s[3] < 0) lockRelease(s);
  s[3]++;
};

/**
 * Bind a task to a semaphore
 */
export const bind =
  <T extends (...args: any[]) => Promise<any>>(f: T, s: Semaphore): T =>
  // @ts-expect-error It is valid
  async (...a) => {
    // Fast path
    s[3]--;
    if (s[3] < 0) await new Promise(s[2]);

    try {
      return await f(...a);
    } finally {
      // Unlock for 1 task
      if (s[3] < 0) release(s);
      s[3]++;
    }
  };
