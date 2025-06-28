/**
 * @module Signal
 *
 * Make promises interruptable
 */

import { sleep } from '.';

/**
 * Describe a signal
 */
export type Signal = [interrupted: boolean];

/**
 * Create a signal
 */
export const init = (): Signal => [false];

/**
 * Check whether the signal has been interrupted
 * @param t
 */
export const interrupted = (t: Signal): boolean => t[0];

/**
 * Interrupt a signal
 * @param t
 */
export const interrupt = (t: Signal): void => {
  t[0] = true;
};

/**
 * Interrupt a signal after a duration
 * @param t
 */
export const timeout = async (t: Signal, ms: number): Promise<void> => {
  await sleep(ms);
  interrupt(t);
};

/**
 * Link a signal to an `AbortSignal`
 * @param t
 * @param signal
 */
export const link = (t: Signal, signal: AbortSignal): void => {
  signal.addEventListener('abort', () => interrupt(t));
};

/**
 * Create a signal that interrupts after ms
 * @param ms
 */
export const duration = (ms: number): Signal => {
  const sig: Signal = [false];
  timeout(sig, ms);
  return sig;
}

/**
 * Create a signal that aborts when the abort signal aborts
 * @param signal
 */
export const bind = (signal: AbortSignal): Signal => {
  const sig: Signal = [false];
  link(sig, signal);
  return sig;
}
