import { type Extend, loadedResolve, loadResolve } from './utils.js';

type QueueItem = (value: true) => void;
export type Semaphore = [
  (QueueItem | null)[],
  len: number,
  head: number,
  tail: number,
  remain: number,
];

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
 * if (!await semaphore.acquire(sem)) {
 *   // Internal queue is full
 * }
 *
 * // Do something and then release the permit.
 * semaphore.release(sem);
 */
export const acquire = (sem: Extend<Semaphore>): Promise<true> | boolean => {
  if (--sem[4] < 0) {
    // queue is full
    if (sem[0].length + sem[4] < 0) {
      sem[4]++;
      return false;
    }

    const promise = new Promise<true>(loadResolve);

    // Push to queue
    const tail = sem[3];
    sem[3] = tail + 1 === sem[1] ? 0 : tail + 1;
    sem[0][tail] = loadedResolve;

    return promise;
  }

  return true;
};

/**
 * Release a permit.
 *
 * @example
 * semaphore.release(sem);
 */
export const release = (sem: Extend<Semaphore>): void => {
  if (sem[4]++ < 0) {
    // Pop from queue
    const head = sem[2];
    sem[2] = head + 1 === sem[1] ? 0 : head + 1;

    sem[0][head]!(true);
    sem[0][head] = null;
  }
};

/**
 * Run a task with concurrency control.
 *
 * @param sem Semaphore to acquire from
 * @param task Task to run
 * @throws When `sem` internal queue is full
 * @returns The limited function
 */
export const run = async <Args extends any[], R>(
  sem: Extend<Semaphore>,
  task: (...args: Args) => Promise<R>,
  ...args: Args
): Promise<R> => {
  if (--sem[4] < 0) {
    // queue is full
    if (sem[0].length + sem[4] < 0) {
      sem[4]++;
      return Promise.reject(new Error('Semaphore internal queue is full'));
    }

    const promise = new Promise<true>(loadResolve);

    // Push to queue
    const tail = sem[3];
    sem[3] = tail + 1 === sem[1] ? 0 : tail + 1;
    sem[0][tail] = loadedResolve;

    await promise;
  }

  try {
    return await task(...args);
  } finally {
    release(sem);
  }
};
