/**
 * @module Queue utilities
 */

/**
 * Describe a fixed-sized queue
 */
export type Fixed<T extends {} = {}> = [
  /**
   * Pre-allocated queue
   */
  buffer: (T | undefined | null)[],
  /**
   * Queue capacity
   */
  capacity: number,
  /**
   * Head pointer
   */
  head: number,
  /**
   * Tail pointer
   */
  tail: number,
];

/**
 * Describe a queue node (singly linked list node)
 */
export type Node<T> = [next: Node<T> | null, value: T];

/**
 * Create a fixed queue
 * @param n - The queue size
 */
export const fixed = <T extends {} = {}>(n: number): Fixed<T> => [
  new Array(n),
  n,
  -1,
  -1,
];
