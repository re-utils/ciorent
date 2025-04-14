/**
 * @module Dropping queues
 */

import type { Fixed } from './queue.js';

export { fixed as init } from './queue.js';
export { pop } from './sliding-queue.js';

/**
 * Push an item to a dropping queue
 * @param q - The queue to push to
 * @param item
 */
export const push = <T extends {}>(q: Fixed<T>, item: T): boolean => {
  if (q[0][(q[2] + 1) % q[1]] != null) return false;
  q[0][(q[2] = (q[2] + 1) % q[1])] = item;
  return true;
};
