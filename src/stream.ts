/**
 * @module Streams
 */

import type { PromiseFn, UnboundedQueue } from './queue.js';

/**
 * Describe a stream
 */
export type Stream<T extends {} = {}> = [
  ...UnboundedQueue<T | ((val?: T) => void)>,
  /**
   * @internal
   * Promise callback caching
   */
  callback: PromiseFn<T>,
  queueing: boolean,
];

/**
 * Create a stream
 */
export const init = <T extends {} = {}>(): Stream<T> => {
  const queue = [null] as any;
  const s: Stream<T> = [
    queue,
    queue,
    (res) => {
      s[0] = s[0][0] = [null, res];
    },
    false,
  ];
  return s;
};

/**
 * Write a value to the stream
 * @param s
 * @param v
 */
export const write = <T extends {} = {}>(s: Stream<T>, v: T): void => {
  if (!s[3]) {
    if (s[1][0] !== null) {
      // @ts-expect-error Queue is storing callbacks
      (s[1] = s[1][0])[1](v);
      return;
    }

    s[3] = true;
  }

  s[0] = s[0][0] = [null, v];
};

/**
 * Read a value from the stream
 * @param s
 */
export const read = async <T extends {} = {}>(
  s: Stream<T>,
): Promise<T | undefined> => {
  if (s[3]) {
    s[1] = s[1][0]!;
    // Whether the queue is empty after the value is sent
    if (s[1][0] === null) s[3] = false;
    return s[1][1] as T;
  }

  return new Promise(s[2]);
};

/**
 * Release all pending read with undefined
 */
export const flush = (s: Stream): void => {
  if (!s[3])
    while (s[1][0] !== null)
      // @ts-expect-error Queue is storing callbacks
      (s[1] = s[1][0])[1]();
};
