/**
 * @module Dropping queues
 */

import type { FixedQueue } from './fixed-queue.js';

export { init } from './fixed-queue.js';
export { pop } from './sliding-queue.js';

/**
 * Push an item to a dropping queue
 * @param q - The queue to push to
 * @param item
 */
export const push = <T extends {}>(q: FixedQueue<T>, item: T): boolean => {
  if (q[0][(q[2] + 1) % q[1]] != null) return false;
  q[0][(q[2] = (q[2] + 1) % q[1])] = item;
  return true;
};
