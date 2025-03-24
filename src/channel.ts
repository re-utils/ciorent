/**
 * @module Channels
 */
import type { QueueNode } from './fixed-queue.js';

/**
 * Describe a channel
 */
export interface Channel<T> {
  /**
   * The head of the value queue
   */
  0: QueueNode<T>;

  /**
   * The tail of the value queue
   */
  1: QueueNode<T>;

  /**
   * The head of the Promise resolve queue
   */
  2: QueueNode<(value?: T) => void>;

  /**
   * The tail of the Promise resolve queue
   */
  3: QueueNode<(value?: T) => void>;
}

/**
 * Create a channel
 */
export const init = <T extends {}>(): Channel<T> => {
  const qu: Channel<T>[1] = [null!, null];
  const resolveQu: Channel<T>[3] = [null!, null];

  return [
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
  if (c[3][1] !== null)
  // Run queue resolve function
    (c[3] = c[3][1])[0](t);
  else
  // Push to normal queue
    c[0] = c[0][1] = [t, null];
};

/**
 * Recieve a message from a channel, return null if the channel is closed
 * @param c
 */
export const recieve = <T>(c: Channel<T>): Promise<T | undefined> => c[1][1] !== null
  // Get the normal queue value
  ? Promise.resolve((c[1] = c[1][1])[0])
  : new Promise((res) => {
    // Add new resolve function to queue
    c[2] = c[2][1] = [res, null];
  });

/**
 * Recieve a message from a channel, return null if no message is currently in queue
 * @param c
 */
export const poll = <T>(c: Channel<T>): T | undefined => c[1][1] !== null
  // Get the normal queue value
  ? (c[1] = c[1][1])[0]
  : undefined;

/**
 * Resolves all pending promises of a channel
 * @param c
 */
export const flush = <T>(c: Channel<T>): void => {
  // Terminate all pending promises
  while (c[3][1] !== null)
    (c[3] = c[3][1])[0]();
};
