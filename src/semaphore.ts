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

/**
 * Control concurrency of a task with a semaphore
 */
export const control =
  <T extends (...args: any[]) => Promise<any>>(task: T, s: Semaphore): T =>
  // @ts-ignore
  async (...args) => {
    if (--s[2] < 0) await new Promise<void>(s[3]);

    try {
      return await task(...args);
    } finally {
      release(s);
    }
  };

/**
 * Set maximum concurrency for a task (fast path)
 */
export const permits = <T extends (...args: any[]) => Promise<any>>(
  task: T,
  permits: number,
): T => control(task, init(permits));

/**
 * Queue a task
 * @param s
 * @param task
 */
export const queue = async <R>(
  s: Semaphore,
  task: () => Promise<R>,
): Promise<R> => {
  if (--s[2] < 0) await new Promise<void>(s[3]);

  try {
    return await task();
  } finally {
    release(s);
  }
};
