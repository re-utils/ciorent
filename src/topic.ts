/**
 * @module Pubsub
 */

import type { Node as QueueNode } from './queue.js';

/**
 * Describe a topic
 */
export interface Topic<T extends {}> {
  /**
   * The head node of the value queue
   */
  0: QueueNode<T>;

  /**
   * The waiting subscriber resolves
   */
  1: ((res: QueueNode<T>) => void)[];

  /**
   * @internal
   * @private
   * Reuse promise callback
   */
  2: (res: (val: QueueNode<T>) => void) => void
}

/**
 * Create a topic
 */
export const init = <T extends {}>(): Topic<T> => {
  const t: Topic<T> = [[null] as any, [], (res) => {
    // Add to waiting promises
    t[1].push(res);
  }];
  return t;
}

/**
 * Describe a topic
 */
export interface Subscriber<T extends {}> {
  0: Topic<T>;

  // Current subscriber queue tail
  1: QueueNode<T>;
}

/**
 * Subscribe to a topic
 * @param t
 */
export const subscribe = <T extends {}>(t: Topic<T>): Subscriber<T> => [
  t,
  t[0]
];

/**
 * Publish to a topic
 * @param t
 */
export const publish = <T extends {}>(t: Topic<T>, value: T): void => {
  const head = (t[0] = t[0][0] = [null, value]);

  for (let i = 0, res = t[1]; i < res.length; i++) res[i](head);
  t[1] = [];
};

/**
 * Resolve all waiting promises and clear all pending values
 * @param t
 */
export const flush = <T extends {}>(t: Topic<T>): void => {
  const head = (t[0] = t[0][0] = [null, void 0 as any]);

  for (let i = 0, res = t[1]; i < res.length; i++) res[i](head);
  t[1] = [];
};

/**
 * Get the next value in the message queue.
 *
 * Returns `undefined` if the message queue is empty
 * @param t
 */
export const poll = <T extends {}>(t: Subscriber<T>): T | undefined =>
  t[1][0] !== null ? (t[1] = t[1][0])[1] : void 0;

/**
 * Get the next value in the message queue
 *
 * Returns a promise that resolves when the message queue is not empty
 * @param t
 */
export const dispatch = async <T extends {}>(
  t: Subscriber<T>,
): Promise<T | undefined> =>
  t[1][0] !== null
    ? (t[1] = t[1][0])[1]
    : (t[1] = await new Promise<QueueNode<T>>(t[0][2]))[1];
