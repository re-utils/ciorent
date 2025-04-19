/**
 * @module Sliding queues
 */

import type { Fixed } from './queue.js';
export { fixed as init } from './queue.js';

/**
 * Push an item to a sliding queue
 * @param q - The queue to push to
 * @param item
 */
export const push = <T extends {}>(q: Fixed<T>, item: T): void => {
  q[0][(q[2] = (q[2] + 1) % q[1])] = item;
};

/**
 * Pop an item from the queue
 * @param q - The queue to pop from
 */
export const pop = <T extends {}>(q: Fixed<T>): T | undefined => {
  const val = q[0][(q[3] + 1) % q[1]];
  if (val != null) {
    q[0][(q[3] = (q[3] + 1) % q[1])] = null;
    return val;
  }
};
