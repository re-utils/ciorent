/**
 * @module Fiber
 */

import { sleep } from ".";

/**
 * Describe a signal
 */
export type Signal = [interrupted: boolean];

/**
 * Describe a fiber function
 */
export type Func<Args extends any[], T> = (signal: Signal, ...args: Args) => T;

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
export const interrupt = (t: Signal): void => { t[0] = true };

/**
 * Interrupt a fiber after a duration
 * @param t
 */
export const timeout = async (t: Signal, ms: number): Promise<void> => {
  await sleep(ms);
  interrupt(t);
}
