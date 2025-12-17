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

const _ = [false];
/**
 * Create a signal that when interrupted will interrupt a group of other signals.
 */
export const group = (signals: Signal[]): Signal =>
  _.concat(signals as any) as any;

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
 * Abort a signal after a duration.
 * @param t
 */
export const abortAfter = (ms: number, t: Signal): void => {
  setTimeout(() => abort(t), ms);
};

/**
 * Create a signal that aborts after ms.
 * @param ms
 */
export const timeout = (ms: number): Signal => {
  const sig: Signal = [false];
  abortAfter(ms, sig);
  return sig;
};

/**
 * Attach a signal to a `DisposableStack` or `AsyncDisposableStack`
 */
export const adopt = (
  t: Signal,
  stack: DisposableStack | AsyncDisposableStack,
): void => {
  stack.adopt(t, abort);
};
