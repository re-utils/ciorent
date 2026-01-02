/**
 * Describe a signal.
 */
export type Signal = [interrupted: boolean, ...parents: Signal[]];

/**
 * Create a signal.
 */
export const init = (): Signal => [false];

/**
 * Create a signal that aborts when any of the input signals abort.
 * @param sigs
 */
export const any = (signals: Signal[]): Signal => {
  const sig: Signal = [false];
  for (let i = 0; i < signals.length; i++) signals[i].push(sig);
  return sig;
};

/**
 * Create a child signal that aborts when the parent signal aborts.
 */
export const fork = (signal: Signal): Signal => {
  const sig: Signal = [false];
  signal.push(sig);
  return signal;
};

/**
 * Check whether the signal has been aborted.
 * @param t
 */
export const aborted = (t: Signal): boolean => t[0];

/**
 * Abort a signal.
 * @param t
 */
export const abort = (t: Signal): void => {
  if (!t[0]) {
    t[0] = true;
    if (t.length > 1) for (let i = 1; i < t.length; i++) abort(t[i] as Signal);
  }
};

/**
 * Create a signal that aborts after ms.
 * @param ms
 */
export const timeout = (ms: number): Signal => {
  const sig: Signal = [false];
  setTimeout(abort, ms, sig);
  return sig;
};

/**
 * Create and attach a signal to a `DisposableStack` or `AsyncDisposableStack`.
 */
export const bind = (
  stack: DisposableStack | AsyncDisposableStack,
): Signal => {
  const sig: Signal = [false];
  stack.adopt(sig, abort);
  return sig;
};
