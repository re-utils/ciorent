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
  const qu: Channel<T>[1] = [null] as any;
  const resolveQu: Channel<T>[3] = [null, null!] as any;

  return [qu, qu, resolveQu, resolveQu];
};

/**
 * Send a message to a channel
 * @param c - The channel to send to
 * @param t - The message to send
 */
export const send = <T>(c: Channel<T>, t: T): void => {
  if (c[3][0] !== null)
    // Run queue resolve function
    (c[3] = c[3][0])[1](t);
  // Push to normal queue
  else c[0] = c[0][0] = [null, t];
};

/**
 * Recieve a message from a channel, return null if the channel is closed
 * @param c
 */
export const recieve = <T>(c: Channel<T>): Promise<T | undefined> =>
  c[1][0] !== null
    ? // Get the normal queue value
      Promise.resolve((c[1] = c[1][0])[1])
    : new Promise((res) => {
        // Add new resolve function to queue
        c[2] = c[2][0] = [null, res];
      });

/**
 * Recieve a message from a channel, return null if no message is currently in queue
 * @param c
 */
export const poll = <T>(c: Channel<T>): T | undefined =>
  c[1][0] !== null
    ? // Get the normal queue value
      (c[0] = c[1][0])[1]
    : undefined;

/**
 * Resolves all pending promises of a channel
 * @param c
 */
export const flush = <T>(c: Channel<T>): void => {
  // Terminate all pending promises
  while (c[3][0] !== null) (c[3] = c[3][0])[1]();
};
