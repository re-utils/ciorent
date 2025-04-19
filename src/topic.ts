/**
 * @module Pubsub
 */

import type { AcquireCallback } from "./lock.js";
import type { Node as QueueNode } from "./queue.js";

/**
 * Describe a topic
 */
export type Topic<T extends {} = {}> = [
  head: QueueNode<T>,
  callback: AcquireCallback<void>,
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
  const t: Topic<T> = [[null] as any, (res) => {
    t[2] = res;
  }, null, null];
  return t;
}

/**
 * Publish a message to the topic
 * @param t - The topic
 * @param m - The message to publish
 */
export const publish = <T extends {} = {}>(t: Topic<T>, m: T): void => {
  t[0] = t[0][0] = [null, m];
  t[2]?.();
  t[2] = null;
}

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
  t, t[0]
];

/**
 * Wait for messages from the topic
 * @param t
 */
export const dispatch = async <T extends {}>(t: Subscriber<T>): Promise<T | undefined> => {
  if (t[1][0] === null)
    await (t[0][2] === null ? t[0][3] = new Promise(t[0][1]) : t[0][3]);

  return (t[1] = t[1][0]!)[1];
}
