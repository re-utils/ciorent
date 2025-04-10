/**
 * @module Fibers
 */

/**
 * Describe a fiber process
 */
export interface Process<TReturn = unknown> {
  /**
   * The waiting promise
   */
  0: Promise<TReturn | undefined>;

  /**
   * Fiber status
   */
  1: 0 | 1 | 2 | 3;

  /**
   * Callback to continue running the fiber
   */
  2: null | (() => void);

  /**
   * Bounded fibers
   */
  3: Process[];
}

/**
 * Describe a fiber runtime
 */
export type Runtime = <const TReturn, const Args extends any[]>(
  gen: (proc: Process<TReturn>, ...args: Args) => Generator<any, TReturn>,
  ...args: Args
) => Process<TReturn>;

/**
 * Check whether the fiber is paused
 */
export const paused = (t: Process): boolean => t[1] === 0;

/**
 * Check whether the fiber is running
 */
export const running = (t: Process): boolean => t[1] === 1;

/**
 * Check whether the fiber is finished
 */
export const done = (t: Process): boolean => t[1] === 2;

/**
 * Check whether the fiber is interrupted
 */
export const stopped = (t: Process): boolean => t[1] === 3;

const invoke = async (g: Generator, thread: Process) => {
  try {
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
      if (thread[1] === 3)
        return;

      // Continue the fiber
      t = g.next(v);
    }

    thread[1] = 2;
    return t.value;
  } finally {
    thread[3].forEach(stop);
  }
};

/**
 * Create a fiber function
 * @param f
 */
export const fn = <
  const Fn extends (thread: Process, ...args: any[]) => Generator,
>(
  f: Fn,
): Fn => f;

/**
 * A basic fiber runtime
 * @param g
 */
export const spawn: Runtime = (f, ...args) => {
  const thread = [null as any as Promise<any>, 1, null, []] as Process;
  thread[0] = invoke(f(thread as any, ...args), thread);
  return thread as any;
};

/**
 * Pause the execution of a fiber
 * @param t
 */
export const pause = (t: Process): void => {
  if (t[1] === 1) t[1] = 0;
};

/**
 * Resume the execution of a fiber
 * @param t
 */
export const resume = (t: Process): void => {
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
export const stop = (t: Process): void => {
  if (t[1] === 0)
    // Can be a no-op
    t[2]?.();

  // This always execute later
  t[1] = 3;
};

/**
 * Wait for a fiber and retrieve its result
 * @param t
 */
export function* join<T extends Process>(
  t: T,
): Generator<Awaited<T[0]>, Awaited<T[0]>> {
  return yield t[0] as any;
}

/**
 * Wait for a fiber to finish and retrieve its result
 * @param t
 */
export const finish = <T extends Process>(t: T): T[3] => t[3];

/**
 * Mount child fiber lifetime to parent lifetime
 * @param child
 * @param parent
 */
export const mount = (child: Process, parent: Process): void => {
  parent[3].push(child);
};

/**
 * Control the fiber with an abort signal
 * @param t
 * @param signal
 */
export const control = (t: Process, signal: AbortSignal): void => {
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
