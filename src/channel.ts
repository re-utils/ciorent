/**
 * @module Channels
 */
import type { Node as QueueNode } from './queue.js';
import {
  release as lockRelease,
  released as lockReleased,
  type Lock,
} from './lock.js';

/**
 * Describe a channel
 */
export interface Channel<T = any> extends Lock<T> {
  /**
   * The head of the value queue
   */
  3: QueueNode<T>;

  /**
   * The tail of the value queue
   */
  4: QueueNode<T>;
}

/**
 * Create a channel
 */
export const init = <T extends {}>(): Channel<T> => {
  const resolveQu: Channel<T>[0] = [null] as any;
  const qu: Channel<T>[3] = [null] as any;

  const chan: Channel<T> = [
    resolveQu,
    resolveQu,
    (res) => {
      chan[0] = chan[0][0] = [null, res];
    },
    qu,
    qu,
  ];
  return chan;
};

/**
 * Send a message to a channel
 * @param c - The channel to send to
 * @param t - The message to send
 */
export const send = <T>(c: Channel<T>, t: T): void => {
  if (lockReleased(c)) c[3] = c[3][0] = [null, t];
  else lockRelease(c, t);
};

/**
 * Recieve a message from a channel, return null if the channel is closed
 * @param c
 */
export const recieve = <T>(c: Channel<T>): Promise<T | undefined> =>
  c[4][0] !== null
    ? // Get the normal queue value
      Promise.resolve((c[4] = c[4][0]!)[1])
    : new Promise(c[2]);

/**
 * Recieve a message from a channel, return undefined if no message is currently in queue
 * @param c
 */
export const poll = <T>(c: Channel<T>): T | undefined =>
  c[4][0] !== null
    ? // Get the normal queue value
      (c[4] = c[4][0])[1]
    : void 0;

export { flush } from './lock.js';
