/**
 * @module Streams
 */

import type { Node as QueueNode } from './queue.js';
import type { AcquireCallback } from './lock.js';

/**
 * Describe a stream
 */
export type Stream<T extends {} = {}> = [
  /**
   * Queue head
   */
  head: QueueNode<T | ((val?: T) => void)>,
  /**
   * Queue tail
   */
  tail: QueueNode<T | ((val?: T) => void)>,
  /**
   * Whether the queue is containing items
   */
  queueing: boolean,
  /**
   * Cached callback
   */
  callback: AcquireCallback<T>,
];

/**
 * Create a stream
 */
export const init = <T extends {} = {}>(): Stream<T> => {
  const queue = [null] as any;
  const s: Stream<T> = [
    queue,
    queue,
    false,
    (res) => {
      s[0] = s[0][0] = [null, res];
    },
  ];
  return s;
};

/**
 * Write a value to the stream
 * @param s
 * @param v
 */
export const write = <T extends {} = {}>(s: Stream<T>, v: T): void => {
  if (!s[2]) {
    if (s[1][0] !== null) {
      // @ts-expect-error Queue is storing callbacks
      (s[1] = s[1][0])[1](v);
      return;
    }

    s[2] = true;
  }

  s[0] = s[0][0] = [null, v];
};

/**
 * Read a value from the stream
 * @param s
 */
export const read = <T extends {} = {}>(
  s: Stream<T>,
): Promise<T | undefined> => {
  if (s[2]) {
    s[1] = s[1][0]!;

    // Whether the queue is empty after the value is sent
    if (s[1][0] === null) s[2] = false;

    return Promise.resolve(s[1][1] as T);
  }

  return new Promise(s[3]);
};

/**
 * Release all pending read with undefined
 */
export const flush = (s: Stream): void => {
  if (!s[2])
    while (s[1][0] !== null)
      // @ts-expect-error Queue is storing callbacks
      (s[1] = s[1][0])[1]();
};
