/**
 * @module Sliding queues
 */

import type { FixedQueue } from './fixed-queue.js';

export { init } from './fixed-queue.js';

/**
 * Push an item to a sliding queue
 * @param q - The queue to push to
 * @param item
 */
export const push = <T extends {}>(q: FixedQueue<T>, item: T): void => {
  q[0][(q[2] = (q[2] + 1) % q[1])] = item;
};

/**
 * Pop an item from the queue
 * @param q - The queue to pop from
 */
export const pop = <T extends {}>(q: FixedQueue<T>): T | undefined => {
  const val = q[0][(q[3] + 1) % q[1]];
  if (val != null) {
    q[0][(q[3] = (q[3] + 1) % q[1])] = null;
    return val;
  }
};
