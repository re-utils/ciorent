/**
 * @module Lock utilities
 */

import type { Node as QueueNode } from './queue.js';

/**
 * Describe a lock
 */
export interface Lock<T = any> {
  /**
   * The head of the Promise resolve queue
   */
  0: QueueNode<(value?: T) => void>;

  /**
   * The tail of the Promise resolve queue
   */
  1: QueueNode<(value?: T) => void>;
}

/**
 * Acquire an item
 * @param lock
 */
export const acquire = <T>(lock: Lock<T>): Promise<T | undefined> =>
  new Promise((res) => {
    lock[0] = lock[0][0] = [null, res];
  });

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
