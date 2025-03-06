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
 * Create a semaphore that allows n access
 */
export const init = (n: number): Semaphore => {
  const root: QueueNode<() => void> = [null!, null];
  return [n, root, root];
};

/**
 * Wait until the semaphore allows access
 */
export const pause = (s: Semaphore): Promise<void> => {
  if (s[0] === 0) {
    // Push to the task queue
    let r;
    const p = new Promise<void>((res) => { r = res; });
    s[1] = s[1][1] = [r!, null];
    return p;
  }

  s[0]--;
  return resolvedPromise;
};

/**
 * Signal to the semaphore to release access
 */
export const signal = (s: Semaphore): void => {
  // No item is in the queue
  if (s[1] === s[2])
    s[0]++;
  else
    (s[2] = s[2][1]!)[0]();
};

/**
 * Create a task that acquire a semaphore and release the access later
 */
export const task = <
  F extends (...args: any[]) => Promise<any>
>(s: Semaphore, f: F): F => (async (...a) => {
  await pause(s);
  const r = await f(...a);
  signal(s);
  return r;
}) as F;
