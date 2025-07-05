/**
 * @module Semaphores
 */

/**
 * Describe a singly linked list node
 */
export type QueueNode = [next: QueueNode | undefined, value: () => void];

/**
 * Describe a semaphore
 */
export type Semaphore = [head: QueueNode, tail: QueueNode, remain: number];

/**
 * Create a semaphore that allows n accesses
 */
export const init = (n: number): Semaphore => {
  const root = [,] as any as QueueNode;
  return [root, root, n];
};

/**
 * Queue a task
 * @param s
 * @param cb
 */
export const queue = async (
  s: Semaphore,
  cb: () => Promise<any>,
): Promise<void> => {
  if (--s[2] < 0) {
    s[0] = s[0][0] = [, cb];
  } else
    try {
      await cb();
    } finally {
      release(s);
    }
};

/**
 * Wait until the semaphore allows access
 */
export const acquire = (s: Semaphore): Promise<void> | void => {
  if (--s[2] < 0)
    return new Promise((cb) => {
      s[0] = s[0][0] = [, cb];
    });
};

/**
 * Signal to the semaphore to release access
 */
export const release = (s: Semaphore): void => {
  // Unlock for 1 task
  if (s[2]++ < 0) (s[1] = s[1][0]!)[1]();
};
