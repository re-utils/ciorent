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
  tail: number,
];

/**
 * Describe a queue node (singly linked list node)
 */
export type QueueNode<T> = [next: QueueNode<T> | null, value: T];

/**
 * Describe an unbounded queue
 */
export type UnboundedQueue<T> = [head: QueueNode<T>, tail: QueueNode<T>];

/**
 * Cached promise callback
 */
export type PromiseFn<T = any> = (res: (value?: T) => void) => void;
