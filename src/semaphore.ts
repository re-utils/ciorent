/**
 * @module Semaphores
 */

import type { PromiseFn, QueueNode, UnboundedQueue } from './queue.js';

/**
 * Describe a semaphore
 */
export type Semaphore = [
  // Promise resolve queue
  ...UnboundedQueue<() => void>,
  callback: PromiseFn<void>,
  remain: number,
];

/**
 * Create a semaphore that allows n accesses
 */
export const init = (n: number): Semaphore => {
  const root = [,] as any as QueueNode<() => void>;

  const sem: Semaphore = [
    root,
    root,
    (res) => {
      sem[0] = sem[0][0] = [, res];
    },
    n,
  ];
  return sem;
};

/**
 * Wait until the semaphore allows access
 */
export const acquire = async (s: Semaphore): Promise<void> => {
  s[3]--;
  if (s[3] < 0) return new Promise(s[2]);
};

/**
 * Signal to the semaphore to release access
 */
export const release = (s: Semaphore): void => {
  // Unlock for 1 task
  if (s[3] < 0) (s[1] = s[1][0]!)[1]();
  s[3]++;
};
