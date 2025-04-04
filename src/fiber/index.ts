/**
 * @module Fiber
 */

/**
 * When the fiber is paused
 */
export const paused = (t: Thread): boolean => t[2] === 0;

/**
 * When the fiber is running
 */
export const running = (t: Thread): boolean => t[2] === 1;

/**
 * When the fiber is done
 */
export const done = (t: Thread): boolean => t[2] === 2;

/**
 * Describe a fiber
 */
export interface Thread<T = unknown, TReturn = unknown> {
  /**
   * The original generator
   */
  0: Generator<T, TReturn>;

  /**
   * The waiting promise
   */
  1: Promise<T | TReturn>;

  /**
   * Fiber status
   */
  2: 0 | 1 | 2;

  /**
   * Callback to continue running the fiber
   */
  3: null | (() => void);
}

/**
 * Describe a fiber runtime
 */
export type Runtime = <const T, const TReturn>(
  gen: Generator<T, TReturn>,
) => Thread<T, TReturn>;

const invoke = async (g: Generator, thread: Thread) => {
  let t = g.next();

  while (!t.done) {
    const v = await t.value;

    // Paused
    if (thread[2] === 0) {
      let r;
      const p = new Promise<any>((res) => {
        r = res;
      });
      thread[3] = r as any;
      await p;
    }

    // If the fiber got stopped
    if (thread[2] === 2) return v;

    // Continue the fiber
    t = g.next(v);
  }

  thread[2] = 2;
  return t.value;
};

/**
 * A basic fiber runtime
 * @param g
 */
export const start: Runtime = (g) => {
  const thread = [g, null as any as Promise<any>, 1, null] as Thread;
  thread[1] = invoke(g, thread);
  return thread as any;
};

/**
 * Pause the execution of a fiber
 * @param t
 */
export const pause = (t: Thread): void => {
  if (t[2] === 1) t[2] = 0;
};

/**
 * Resume the execution of a fiber
 * @param t
 */
export const resume = (t: Thread): void => {
  if (t[2] === 0) {
    t[2] = 1;
    // Can be a no-op
    t[3]?.();
  }
};

/**
 * Stop the execution of a fiber and retrieve the result
 * @param t
 */
export const stop = <T extends Thread>(t: T): T[1] => {
  if (t[2] === 0) {
    t[2] = 2;
    t[3]!();
  } else t[2] = 2;

  return t[1];
};

/**
 * Wait for a fiber and retrieve its result
 * @param t
 */
export function* join<T extends Thread>(
  t: T,
): Generator<Awaited<T[1]>, Awaited<T[1]>> {
  return yield t[1] as any;
};

/**
 * Wait for a fiber to finish and retrieve its result
 * @param t
 */
export const finish = <T extends Thread>(t: T): T[1] => t[1];

/**
 * Wait for a promise to resolve then retrieve its result
 */
export function* wait<T extends Promise<any>>(
  t: T,
): Generator<Awaited<T>, Awaited<T>> {
  return yield t as any;
};
