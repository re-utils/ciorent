import { type Extend, loadedResolve, loadResolve } from './utils.js';

type QueueItem = () => void;
type Queue = [(QueueItem | null)[], len: number, head: number, tail: number];

const push = (qu: Extend<Queue>, item: QueueItem): void => {
  const tail = qu[3];
  qu[3] = tail + 1 === qu[1] ? 0 : tail + 1;
  qu[0][tail] = item;
};

const pop = (qu: Extend<Queue>): QueueItem => {
  const head = qu[2];
  qu[2] = head + 1 === qu[1] ? 0 : head + 1;

  const val = qu[0][head];
  qu[0][head] = null;
  return val!;
};

export type Semaphore = [...Queue, remain: number];

/**
 * Check whether the semaphore queue is full.
 */
export const full = (qu: Extend<Semaphore>): boolean =>
  qu[0].length + qu[4] <= 0;

/**
 * Create a semaphore.
 *
 * @example
 * // maximum of 10 concurrent tasks and 200 waiting tasks.
 * const sem = semaphore.init(10, 200);
 */
export const init = (permits: number, capacity: number): Semaphore => [
  new Array(capacity).fill(null),
  capacity,
  0,
  0,
  permits,
];

/**
 * Acquire a permit.
 *
 * @example
 *
 * if (semaphore.full(sem)) {
 *   // Internal queue is full
 * }
 *
 * await semaphore.acquire(sem);
 *
 * // Do something and then release the permit.
 * semaphore.release(sem);
 */
export const acquire = (sem: Extend<Semaphore>): Promise<void> | void => {
  if (--sem[4] < 0) {
    const promise = new Promise<void>(loadResolve);
    push(sem, loadedResolve);
    return promise;
  }
};

/**
 * Release a permit.
 *
 * @example
 * semaphore.release(sem);
 */
export const release = (sem: Extend<Semaphore>): void => {
  sem[4]++ < 0 && pop(sem)();
};

/**
 * @param task Task to limit
 * @param sem Target semaphore
 * @throws {Error} when `sem` internal queue is full
 * @returns The limited function
 */
export const limit = <Fn extends (...args: any[]) => Promise<any>>(
  task: Fn,
  sem: Extend<Semaphore>,
): Fn =>
  (async (...args: any[]) => {
    if (full(sem)) throw new Error('Semaphore internal queue is full');

    if (--sem[4] < 0) {
      const promise = new Promise<void>(loadResolve);
      push(sem, loadedResolve);
      await promise;
    }

    try {
      return await task(...args);
    } finally {
      release(sem);
    }
  }) as any;
