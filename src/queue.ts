/**
 * @module Queue utilities
 */

/**
 * Describe a fixed-sized queue
 */
export interface Fixed<T extends {}> {
  /**
   * Pre-allocated queue
   */
  readonly 0: (T | undefined | null)[];

  /**
   * Queue capacity
   */
  readonly 1: number;

  /**
   * Head pointer
   */
  2: number;

  /**
   * Tail pointer
   */
  3: number;
}

/**
 * Describe a queue node (singly linked list node)
 */
export interface Node<T> {
  0: Node<T> | null;
  1: T;
}

/**
 * Create a fixed queue
 * @param n - The queue size
 */
export const fixed = <T extends {}>(n: number): Fixed<T> => [
  new Array(n),
  n,
  -1,
  -1,
];
