/**
 * @module Queue utilities
 */

/**
 * Describe a fixed-sized queue
 */
export type FixedQueue<T extends {} = {}> = [
  buffer: (T | undefined | null)[],
  capacity: number,
  head: number,
  tail: number
];

/**
 * Describe a queue node (singly linked list node)
 */
export type QueueNode<T> = [next: QueueNode<T> | null, value: T];

/**
 * Describe an unbounded queue
 */
export type UnboundedQueue<T> = [
  head: QueueNode<T>,
  tail: QueueNode<T>
];

/**
 * @internal
 * Promise callback caching
 */
export type PromiseFn<T = any> = (res: (value?: T) => void) => void;

/**
 * Create a fixed queue
 * @param n - The queue size
 */
export const fixed = <T extends {} = {}>(n: number): FixedQueue<T> => [
  new Array(n),
  n,
  -1,
  -1,
];
