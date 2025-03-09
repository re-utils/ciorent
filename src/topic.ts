/**
 * @module Pubsub
 */

import type { QueueNode } from './fixed-queue';

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
  1: ((res?: T) => void)[];

  /**
   * The waiting subscribers
   */
  2: Subscriber<T>[];
}

/**
 * Create a topic
 */
export const init = <T extends {}>(): Topic<T> => [[null!, null], [], []];

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
export const sub = <T extends {}>(t: Topic<T>): Subscriber<T> => [t, t[0]];

/**
 * Subscribe to a topic
 * @param t
 */
export const pub = <T extends {}>(t: Topic<T>, value: T): void => {
  const head = t[0] = t[0][1] = [value, null];

  // Flush the waiting queue
  for (let i = 0, res = t[1], subs = t[2]; i < res.length; i++) {
    // Resolve the waiting promise
    res[i](value);

    // Update subscriber tail pointer
    subs[i][1] = head;
  }

  // Reset the waiting lists
  t[1] = [];
  t[2] = [];
};

/**
 * Resolve all waiting promises and clear all pending values
 * @param t
 */
export const flush = <T extends {}>(t: Topic<T>): void => {
  const head: QueueNode<T> = t[0] = [null!, null];

  // Flush the waiting queue
  for (let i = 0, res = t[1], subs = t[2]; i < res.length; i++) {
    // Resolve the waiting promise
    res[i]();

    // Update subscriber tail pointer
    subs[i][1] = head;
  }

  // Reset the waiting lists
  t[1] = [];
  t[2] = [];
};

/**
 * Get the next value in the message queue.
 *
 * Returns `undefined` if the message queue is empty
 * @param t
 */
export const poll = <T extends {}>(t: Subscriber<T>): T | undefined => t[1][1] !== null
  ? (t[1] = t[1][1])[0]
  : undefined;

/**
 * Get the next value in the message queue
 *
 * Returns a promise that resolves when the message queue is not empty
 * @param t
 */
export const next = <T extends {}>(t: Subscriber<T>): Promise<T | undefined> => {
  if (t[1][1] !== null)
    return Promise.resolve((t[1] = t[1][1])[0]);

  // Add to waiting promises
  const topic = t[0];

  topic[2].push(t);
  return new Promise((res) => {
    topic[1].push(res);
  });
};
