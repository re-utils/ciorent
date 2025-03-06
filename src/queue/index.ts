/**
 * Describe a fixed-sized queue
 */
export interface FixedQueue<T extends {}> {
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
 * Create a fixed queue.
 * @param n - The queue size
 */
export default <T extends {}>(n: number): FixedQueue<T> => [new Array(n), n, -1, -1];
