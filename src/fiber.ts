/**
 * @module Fibers
 */

/**
 * Check whether the fiber is paused
 */
export const paused = (t: Thread): boolean => t[1] === 0;

/**
 * Check whether the fiber is running
 */
export const running = (t: Thread): boolean => t[1] === 1;

/**
 * Check whether the fiber is done
 */
export const done = (t: Thread): boolean => t[1] === 2;

/**
 * Describe a fiber
 */
export interface Thread<T = unknown, TReturn = unknown> {
  /**
   * The waiting promise
   */
  0: Promise<T | TReturn>;

  /**
   * Fiber status
   */
  1: 0 | 1 | 2;

  /**
   * Callback to continue running the fiber
   */
  2: null | (() => void);

  /**
   * Bounded threads
   */
  3: Thread[];
}

/**
 * Describe a fiber runtime
 */
export type Runtime = <const T, const TReturn, const Args extends any[]>(
  gen: (thread: Thread<T, TReturn>, ...args: Args) => Generator<T, TReturn>,
  ...args: Args
) => Thread<T, TReturn>;

const invoke = async (g: Generator, thread: Thread) => {
  let t = g.next();

  while (!t.done) {
    const v = await t.value;

    // Paused
    if (thread[1] === 0) {
      let r;
      const p = new Promise<any>((res) => {
        r = res;
      });
      thread[2] = r as any;
      await p;
    }

    // If the fiber got stopped
    if (thread[1] === 2) {
      thread[3].forEach(stop);
      return v;
    }

    // Continue the fiber
    t = g.next(v);
  }

  thread[1] = 2;
  thread[3].forEach(stop);
  return t.value;
};

/**
 * Create a fiber function
 * @param f
 */
export const fn = <
  const Fn extends (thread: Thread, ...args: any[]) => Generator,
>(
  f: Fn,
): Fn => f;

/**
 * A basic fiber runtime
 * @param g
 */
export const spawn: Runtime = (f, ...args) => {
  const thread = [null as any as Promise<any>, 1, null, []] as Thread;
  thread[0] = invoke(f(thread as any, ...args), thread);
  return thread as any;
};

/**
 * Pause the execution of a fiber
 * @param t
 */
export const pause = (t: Thread): void => {
  if (t[1] === 1) t[1] = 0;
};

/**
 * Resume the execution of a fiber
 * @param t
 */
export const resume = (t: Thread): void => {
  if (t[1] === 0) {
    t[1] = 1;
    // Can be a no-op
    t[2]?.();
  }
};

/**
 * Stop the execution of a fiber
 * @param t
 */
export const stop = (t: Thread): void => {
  if (t[1] === 0) {
    t[1] = 2;
    // Can be a no-op
    t[2]?.();
  } else t[1] = 2;
};

/**
 * Wait for a fiber and retrieve its result
 * @param t
 */
export function* join<T extends Thread>(
  t: T,
): Generator<Awaited<T[1]>, Awaited<T[1]>> {
  return yield t[1] as any;
}

/**
 * Wait for a fiber to finish and retrieve its result
 * @param t
 */
export const finish = <T extends Thread>(t: T): T[1] => t[1];

/**
 * Mount child fiber lifetime to parent lifetime
 * @param child
 * @param parent
 */
export const mount = (child: Thread, parent: Thread): void => {
  parent[3].push(child);
};

/**
 * Control the fiber with an abort signal
 * @param t
 * @param signal
 */
export const control = (t: Thread, signal: AbortSignal): void => {
  signal.addEventListener('abort', () => {
    stop(t);
  });
};

/**
 * Unwrap a promise result
 */
export function* unwrap<T extends Promise<any>>(
  t: T,
): Generator<Awaited<T>, Awaited<T>> {
  return yield t as any;
}
