/**
 * @module Pubsub
 */

import type { PromiseFn, QueueNode } from './queue.js';

/**
 * Describe a topic
 */
export type Topic<T extends {} = {}> = [
  head: QueueNode<T>,
  callback: PromiseFn<void>,
  resolve: (() => void) | null,
  pending: Promise<void> | null,
];

/**
 * Describe a subscriber
 */
export type Subscriber<T extends {} = {}> = [
  topic: Topic<T>,
  tail: QueueNode<T>,
];

/**
 * Create a topic
 */
export const init = <T extends {} = {}>(): Topic<T> => {
  const t: Topic<T> = [
    [null] as any,
    (res) => {
      t[2] = res;
    },
    null,
    null,
  ];
  return t;
};

/**
 * Publish a message to the topic
 * @param t - The topic
 * @param m - The message to publish
 */
export const publish = <T extends {} = {}>(t: Topic<T>, m: T): void => {
  t[0] = t[0][0] = [null, m];
  t[2]?.();
  t[2] = null;
};

/**
 * Resolve all pending dispatch
 */
export const flush: (t: Topic) => void = publish as any;

/**
 * Subscribe to a topic
 * @param t
 * @returns A subscriber object
 */
export const subscribe = <T extends {}>(t: Topic<T>): Subscriber<T> => [
  t,
  t[0],
];

/**
 * Wait for messages from the topic
 * @param s
 */
export const dispatch = async <T extends {}>(
  s: Subscriber<T>,
): Promise<T | undefined> => {
  if (s[1][0] === null)
    await (s[0][2] !== null ? s[0][3] : (s[0][3] = new Promise(s[0][1])));

  return (s[1] = s[1][0]!)[1];
};
