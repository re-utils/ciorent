/**
 * @module
 * Semaphores
 */

import { pause as resolvedPromise } from '.';
import type { QueueNode } from './queue';

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
    const p = new Promise<void>((res) => { r = res; });
    s[1] = s[1][1] = [r!, null];
    return p;
  }

  return resolvedPromise;
};

/**
 * Signal to the semaphore to release access
 */
export const signal = (s: Semaphore): void => {
  // Unlock for 1 thread
  if (s[0] < 0)
    (s[2] = s[2][1]!)[0]();

  s[0]++;
};

/**
 * Create a task that acquire a semaphore and release the access later
 */
export const task = <
  F extends (...args: any[]) => Promise<any>
>(s: Semaphore, f: F): F => (async (...a) => {
  try {
    console.log('Allowed', s[0]);
    await pause(s);
    // eslint-disable-next-line
    return f(...a);
  } finally {
    signal(s);
  }
}) as F;
