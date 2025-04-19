/**
 * @module Lock utilities
 */

import type { Node as QueueNode } from './queue.js';

/**
 * Describe a lock
 */
export type Lock<T = any> = [
  /**
   * The head of the Promise resolve queue
   */
  head: QueueNode<(value?: T) => void>,
  /**
   * The tail of the Promise resolve queue
   */
  tail: QueueNode<(value?: T) => void>,
  /**
   * @internal
   * @private
   * Reuse promise callback
   */
  callback: AcquireCallback<T>,
];

/**
 * @internal
 * @private
 * Acquire callback caching
 */
export type AcquireCallback<T = any> = (res: (value?: T) => void) => void;

/**
 * Release an item
 * @param lock
 * @param value
 */
export const release = <T>(lock: Lock<T>, value?: T): void => {
  (lock[1] = lock[1][0]!)[1](value);
};

/**
 * Return true if all items are released
 * @param lock
 */
export const released = (lock: Lock): boolean => lock[1][0] === null;

/**
 * Release all items of a lock
 * @param lock
 */
export const flush = (lock: Lock): void => {
  while (lock[1][0] !== null) (lock[1] = lock[1][0])[1]();
};
