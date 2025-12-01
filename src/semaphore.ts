import type { Extend } from "./types.ts";

/**
 * Describe a singly linked list node
 */
export type QueueNode = [next: QueueNode | null, value: () => void];

/**
 * Describe a semaphore
 */
export type Semaphore = [
  head: QueueNode,
  tail: QueueNode,
  remain: number,
  register: (cb: () => void) => void
];

/**
 * Create a semaphore that allows n accesses
 */
export const init = (n: number): Semaphore => {
  const r: QueueNode = [null, null!];
  const s: Semaphore = [
    r,
    r,
    n,
    (f) => {
      s[0] = s[0][0] = [null, f];
    },
  ];
  return s;
};

/**
 * Wait until the semaphore allows access
 */
export const acquire = (s: Extend<Semaphore>): Promise<void> | void => {
  if (--s[2] < 0) return new Promise(s[3]);
};

/**
 * Signal to the semaphore to release access
 */
export const release = (s: Extend<Semaphore>): void => {
  if (s[2]++ < 0) (s[1] = s[1][0]!)[1]();
};

/**
 * Control concurrency of a task with a semaphore
 */
export const control =
  <T extends (...args: any[]) => Promise<any>>(task: T, s: Extend<Semaphore>): T =>
  // @ts-ignore
  async (...args) => {
    // Skip a microtask if not blocked
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
  perms: number,
): T => control(task, init(perms));

/**
 * Queue a task
 * @param s
 * @param task
 */
export const queue = async <R>(
  s: Extend<Semaphore>,
  task: () => Promise<R>,
): Promise<R> => {
  // Skip a microtask if not blocked
  if (--s[2] < 0) await new Promise<void>(s[3]);

  try {
    return await task();
  } finally {
    release(s);
  }
};
