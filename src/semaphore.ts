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
export type Semaphore = [
  head: QueueNode,
  tail: QueueNode,
  remain: number,
  register: (cb: () => void) => void,
];

/**
 * Create a semaphore that allows n accesses
 */
export const init = (n: number): Semaphore => {
  const r = [,] as any as QueueNode;
  const s: Semaphore = [
    r,
    r,
    n,
    (f) => {
      s[0] = s[0][0] = [, f];
    },
  ];
  return s;
};

/**
 * Wait until the semaphore allows access
 */
export const acquire = (s: Semaphore): Promise<void> | void => {
  if (--s[2] < 0) return new Promise(s[3]);
};

/**
 * Signal to the semaphore to release access
 */
export const release = (s: Semaphore): void => {
  // Unlock for 1 task
  if (s[2]++ < 0) (s[1] = s[1][0]!)[1]();
};
