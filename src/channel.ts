/**
 * @module
 * Channels
 */

import type { QueueNode } from './queue';

/**
 * Describe a channel
 */
export interface Channel<T> {
  /**
   * Opening state of the channel
   */
  0: boolean;

  /**
   * The head of the value queue
   */
  1: QueueNode<T>;

  /**
   * The tail of the value queue
   */
  2: QueueNode<T>;

  /**
   * The head of the Promise resolve queue
   */
  3: QueueNode<(value: T | null) => void>;

  /**
   * The tail of the Promise resolve queue
   */
  4: QueueNode<(value: T | null) => void>;
}

const resolvedNull = Promise.resolve(null);

/**
 * Create a channel
 */
export const init = <T extends {}>(): Channel<T> => {
  const qu: Channel<T>[1] = [null!, null];
  const resolveQu: Channel<T>[3] = [null!, null];

  return [
    true,
    qu,
    qu,
    resolveQu,
    resolveQu
  ];
};

/**
 * Send a message to a channel
 * @param c - The channel to send to
 * @param t - The message to send
 */
export const send = <T>(c: Channel<T>, t: T): void => {
  if (c[0]) {
    if (c[4][1] !== null)
      // Run queue resolve function
      (c[4] = c[4][1])[0](t);
    else
      // Push to normal queue
      c[1] = c[1][1] = [t, null];
  }
};

/**
 * Recieve a message from a channel, return null if the channel is closed
 * @param c
 */
export const recieve = <T>(c: Channel<T>): Promise<T | null> => c[2][1] !== null
  // Get the normal queue value
  ? Promise.resolve((c[2] = c[2][1])[0])
  : c[0]
    ? new Promise((res) => {
      // Add new resolve function to queue
      c[3] = c[3][1] = [res, null];
    }) as any
    : resolvedNull;

/**
 * Recieve a message from a channel, return null if no message is currently in queue
 * @param c
 */
export const poll = <T>(c: Channel<T>): T | null => c[2][1] !== null
  // Get the normal queue value
  ? (c[2] = c[2][1])[0]
  : null;

/**
 * Close a channel
 * @param c
 */
export const close = <T>(c: Channel<T>): void => {
  c[0] = false;

  // Terminate all pending promises
  while (c[4][1] !== null)
    (c[4] = c[4][1])[0](null);
};

/**
 * Check whether a channel is still open
 * @param c
 */
export const active = (c: Channel<any>): boolean => c[0];
