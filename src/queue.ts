/**
 * @module Queue types
 * @private
 */

/**
 * Describe a queue node (singly linked list node)
 */
export type QueueNode<T> = [next: QueueNode<T> | undefined, value: T];

/**
 * Describe an unbounded queue
 */
export type UnboundedQueue<T> = [head: QueueNode<T>, tail: QueueNode<T>];

/**
 * Cached promise callback
 */
export type PromiseFn<T = any> = (res: (value?: T) => void) => void;
