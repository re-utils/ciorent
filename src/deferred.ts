import { loadedResolve, loadResolve } from './utils.js';

export interface Deferred<T> {
  get: Promise<T>;
  set: T extends undefined ? (value?: T) => void : (value: T) => void;
}

/**
 * Create a deferred value.
 *
 * @example
 * const result = deferred.init();
 *
 * // Set result value, unblock all
 * // coroutines waiting for the results
 * result.set(10);
 *
 * // Get result value
 * await result.get;
 */
export const init = <T>(): Deferred<T> => ({
  get: new Promise<T>(loadResolve),
  set: loadedResolve as any,
});

/**
 * Reset a deferred value.
 */
export const reset = (value: Deferred<any>): void => {
  value.get = new Promise(loadResolve);
  value.set = loadedResolve;
};
