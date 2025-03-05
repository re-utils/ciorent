/**
 * @module
 * Channels
 */

type QueueNode<T> = [T, QueueNode<T> | null];

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
  1: QueueNode<Promise<T | typeof closed>>;

  /**
   * The tail of the value queue
   */
  2: QueueNode<Promise<T | typeof closed>>;

  /**
   * The head of the Promise resolve queue
   */
  3: QueueNode<(value: Promise<T | typeof closed> | T | typeof closed) => void>;

  /**
   * The tail of the Promise resolve queue
   */
  4: QueueNode<(value: Promise<T | typeof closed> | T | typeof closed) => void>;
}

/**
 * A signal that means the channel has closed
 */
export const closed: unique symbol = Symbol();
const closedPromise = Promise.resolve(closed);

/**
 * Create a channel
 */
export const init = <T>(): Channel<T> => {
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
export const send = <T>(c: Channel<T>, t: Promise<T> | T): void => {
  if (c[0]) {
    if (c[4][1] !== null)
      // Run queue resolve function
      (c[4] = c[4][1])[0](t);
    else
      // Push to normal queue
      c[1] = c[1][1] = [t instanceof Promise ? t : Promise.resolve(t), null];
  }
};

/**
 * Recieve a message from a channel
 * @param c
 */
export const recieve = <T>(c: Channel<T>): Promise<T | typeof closed> => c[2][1] !== null
  // Get the normal queue value
  ? (c[2] = c[2][1])[0]
  : c[0]
    ? new Promise((res) => {
      // Add new resolve function to queue
      c[3] = c[3][1] = [res, null];
    }) as any
    : closedPromise;

/**
 * Close a channel
 * @param c
 */
export const close = <T>(c: Channel<T>): void => {
  c[0] = false;

  // Terminate all pending promises
  while (c[4][1] !== null)
    (c[4] = c[4][1])[0](closed);
};

/**
 * Check whether a channel is still open yet
 * @param c
 */
export const active = (c: Channel<any>): boolean => c[0];
